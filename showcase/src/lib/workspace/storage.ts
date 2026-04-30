import { parseProject, type Project } from "./data";

const DATABASE = "strike-annotation-workspace";
const STORE = "projects";
let writes = Promise.resolve();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Browser storage is unavailable. Export a backup to keep your annotations."));
      return;
    }
    const request = indexedDB.open(DATABASE, 1);
    let blocked = false;
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "project_id" });
    };
    request.onerror = () => reject(request.error ?? new Error("Could not open saved annotations."));
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Another tab is blocking annotation storage. Close other Strike workspace tabs and retry."));
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      if (blocked) database.close();
      else resolve(database);
    };
  });
}

export async function listProjects(): Promise<Project[]> {
  await writes;
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, "readonly");
    const request = transaction.objectStore(STORE).getAll();
    let projects: Project[];
    request.onsuccess = () => {
      try {
        const values: unknown = request.result;
        if (!Array.isArray(values)) throw new Error("Saved annotations are not a valid project list.");
        projects = values.map((value: unknown) => parseProject(value));
      } catch (error) {
        reject(error);
        transaction.abort();
      }
    };
    transaction.oncomplete = () => {
      database.close();
      resolve(projects.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)));
    };
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not read saved annotations."));
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Reading saved annotations was interrupted."));
    };
  });
}

function writeProject(project: Project | string, expectedUpdatedAt?: string | null): Promise<void> {
  const operation = writes.then(async () => {
    const database = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      const store = transaction.objectStore(STORE);
      let conflict: Error | undefined;
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => reject(conflict ?? transaction.error ?? new Error("Could not save annotations. Export a backup before leaving."));
      transaction.onabort = () => {
        database.close();
        reject(conflict ?? transaction.error ?? new Error("Annotations were not saved. Export a backup before leaving."));
      };
      const write = () => {
        if (typeof project === "string") store.delete(project);
        else store.put(project);
      };
      if (expectedUpdatedAt === undefined) {
        write();
        return;
      }
      const request = store.get(typeof project === "string" ? project : project.project_id);
      request.onsuccess = () => {
        const existing: unknown = request.result;
        const matches = expectedUpdatedAt === null
          ? existing === undefined
          : existing !== null && typeof existing === "object" && "updated_at" in existing && existing.updated_at === expectedUpdatedAt;
        if (!matches) {
          conflict = new Error("This project changed in another tab. Export your current annotations, then reload the saved project before editing again.");
          transaction.abort();
          return;
        }
        write();
      };
    });
  });
  writes = operation.catch(() => undefined);
  return operation;
}

export function saveProject(project: Project, expectedUpdatedAt?: string | null): Promise<void> {
  return writeProject(parseProject(project), expectedUpdatedAt);
}

export function deleteProject(id: string, expectedUpdatedAt?: string | null): Promise<void> {
  if (!id.trim()) return Promise.reject(new Error("Choose a saved project to delete."));
  return writeProject(id, expectedUpdatedAt);
}
