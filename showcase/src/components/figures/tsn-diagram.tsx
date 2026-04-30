/* Static SVG of the TSN forward pass: 5 frames → shared ResNet-50 → temporal
   consensus (avg pool) → FC head → softmax. Backbone frozen, head fine-tuned. */

export function TSNDiagram() {
  const FRAMES = [0, 1, 2, 3, 4];

  return (
    <svg
      viewBox="0 0 920 220"
      className="block h-auto w-full bg-paper"
      role="img"
      aria-label="TSN forward pass: five frames pass through a shared ResNet-50, are averaged, then classified."
    >
      <defs>
        <marker
          id="tsn-arr"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#888" />
        </marker>
      </defs>

      {/* Five frame thumbnails */}
      {FRAMES.map((i) => (
        <g key={i}>
          <rect
            x={20 + i * 46}
            y={50}
            width={42}
            height={56}
            fill="#141414"
            stroke="#333"
          />
          <text
            x={20 + i * 46 + 21}
            y={82}
            textAnchor="middle"
            fontSize={11}
            fontFamily="ui-monospace, monospace"
            fill="#666"
          >
            f{i + 1}
          </text>
        </g>
      ))}
      <text
        x={134}
        y={36}
        textAnchor="middle"
        fontSize={11}
        letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace"
        fill="#888"
      >
        5× RGB FRAMES
      </text>
      <text
        x={134}
        y={126}
        textAnchor="middle"
        fontSize={11}
        fontFamily="ui-monospace, monospace"
        fill="#666"
      >
        224×224 · ImageNet norm
      </text>

      {/* Arrows from frames into the backbone */}
      {FRAMES.map((i) => (
        <line
          key={i}
          x1={62 + i * 46}
          x2={310}
          y1={78}
          y2={78 + (i - 2) * 8}
          stroke="#888"
          strokeWidth={0.6}
          markerEnd="url(#tsn-arr)"
        />
      ))}

      {/* Shared ResNet-50 backbone */}
      <rect
        x={310}
        y={42}
        width={170}
        height={72}
        fill="#0a0a0a"
        stroke="#dc2626"
        strokeWidth={1.5}
      />
      <text
        x={395}
        y={68}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fontFamily="ui-monospace, monospace"
        fill="#e8e6e1"
      >
        ResNet-50
      </text>
      <text
        x={395}
        y={86}
        textAnchor="middle"
        fontSize={11}
        fontFamily="ui-monospace, monospace"
        fill="#888"
      >
        shared backbone
      </text>
      <text
        x={395}
        y={104}
        textAnchor="middle"
        fontSize={10}
        fontFamily="ui-monospace, monospace"
        fill="#666"
      >
        Kinetics-400 pretrain
      </text>
      <text
        x={395}
        y={32}
        textAnchor="middle"
        fontSize={11}
        letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace"
        fill="#dc2626"
      >
        PER-FRAME FEATURES
      </text>

      {/* Backbone → consensus arrow */}
      <line
        x1={480}
        y1={78}
        x2={540}
        y2={78}
        stroke="#888"
        strokeWidth={0.8}
        markerEnd="url(#tsn-arr)"
      />
      <text
        x={510}
        y={70}
        textAnchor="middle"
        fontSize={10}
        fontFamily="ui-monospace, monospace"
        fill="#666"
      >
        5×2048
      </text>

      {/* Temporal consensus */}
      <rect
        x={540}
        y={50}
        width={130}
        height={56}
        fill="#141414"
        stroke="#444"
      />
      <text
        x={605}
        y={75}
        textAnchor="middle"
        fontSize={12}
        fontFamily="ui-monospace, monospace"
        fill="#e8e6e1"
      >
        avg pool
      </text>
      <text
        x={605}
        y={92}
        textAnchor="middle"
        fontSize={10}
        fontFamily="ui-monospace, monospace"
        fill="#888"
      >
        temporal consensus
      </text>
      <text
        x={605}
        y={32}
        textAnchor="middle"
        fontSize={11}
        letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace"
        fill="#888"
      >
        AGGREGATE
      </text>

      {/* Consensus → head arrow */}
      <line
        x1={670}
        y1={78}
        x2={730}
        y2={78}
        stroke="#888"
        strokeWidth={0.8}
        markerEnd="url(#tsn-arr)"
      />
      <text
        x={700}
        y={70}
        textAnchor="middle"
        fontSize={10}
        fontFamily="ui-monospace, monospace"
        fill="#666"
      >
        2048
      </text>

      {/* FC classification head */}
      <rect
        x={730}
        y={50}
        width={170}
        height={56}
        fill="#141414"
        stroke="#dc2626"
      />
      <text
        x={815}
        y={75}
        textAnchor="middle"
        fontSize={12}
        fontFamily="ui-monospace, monospace"
        fill="#e8e6e1"
      >
        FC → softmax
      </text>
      <text
        x={815}
        y={92}
        textAnchor="middle"
        fontSize={10}
        fontFamily="ui-monospace, monospace"
        fill="#888"
      >
        2 classes
      </text>
      <text
        x={815}
        y={32}
        textAnchor="middle"
        fontSize={11}
        letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace"
        fill="#dc2626"
      >
        CLASSIFY
      </text>

      {/* Output */}
      <text
        x={815}
        y={140}
        textAnchor="middle"
        fontSize={11}
        fontFamily="ui-monospace, monospace"
        fill="#888"
      >
        P(strike), P(neutral)
      </text>
      <text
        x={815}
        y={158}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fontFamily="ui-monospace, monospace"
        fill="#dc2626"
      >
        e.g. 0.847 / 0.153
      </text>

      {/* Trainable indicator */}
      <text
        x={460}
        y={200}
        textAnchor="middle"
        fontSize={10}
        letterSpacing="0.1em"
        fontFamily="ui-monospace, monospace"
        fill="#666"
      >
        — frozen backbone · fine-tuned classifier head only —
      </text>
    </svg>
  );
}
