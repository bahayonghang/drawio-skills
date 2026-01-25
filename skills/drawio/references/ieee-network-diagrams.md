# IEEE Network Diagram Standards for Draw.io

This guide focuses on creating network diagrams that adhere to IEEE and academic standards (e.g., IEEE 315, ANSI Y32.2) using Draw.io.

> **Related**: See `math-typesetting.md` for LaTeX formula reference and IEEE domain equations.

## 1. Symbol Standardization

### 1.1 Core Devices
*   **Router**: Circle with four arrows pointing inward (X shape) or standard cylinder with arrows.
*   **Switch**: Square/Box with diverging arrows.
*   **Firewall**: Brick wall icon.
*   **Server**: Tower or Rack icon.
*   **Cloud/Internet**: Cloud shape.

### 1.2 Link Representation
*   **Solid Line**: Physical Ethernet/Fiber link.
*   **Dashed Line**: Logical link (VLAN, VPN, Tunnel).
*   **Lightning Bolt / Zigzag**: Wireless or WAN link.
*   **Bus Line**: Thick straight line for Ethernet bus (older style) or Backbone.

## 2. Information Hierarchy

### 2.1 Topology Layers
Organize the diagram into logical tiers:
1.  **Core Layer**: High-speed backbone switches/routers.
2.  **Distribution Layer**: Aggregation switches.
3.  **Access Layer**: End-user switches and APs.

### 2.2 Visual Cues
*   **Size**: Core devices should appear slightly larger or more prominent.
*   **Position**: Core at top or center; Access at bottom or periphery.
*   **Grouping**: Use dashed rectangles to group devices by:
    *   Physical Location (Building A, Floor 1)
    *   Logical Segment (DMZ, Internal, Guest)

## 3. Labeling & Annotations (IEEE Style)

*   **Device Names**: Use standardized codes (e.g., `R1`, `SW-Core-01`).
*   **Interfaces**: Label ports near the connection (e.g., `Gi0/1`, `eth0`).
*   **IP Addresses**: Small font (8-9pt) below the device or interface.
*   **Titles**: Figure Number and Title at the bottom (e.g., "Fig. 1. Proposed Network Architecture").
*   **Legend**: **Mandatory** for academic papers. Explain all line types, colors, and non-standard icons.

## 4. Black & White / Greyscale Optimization
Academic papers often print in B&W.
*   **Avoid Color-Only Coding**: Don't rely solely on Red vs. Green. Use Solid vs. Dashed lines.
*   **Patterns**: Use fill patterns (dots, stripes) for zones instead of just solid colors.
*   **Contrast**: Ensure text is black on white or white on black.

## 5. Draw.io Implementation Steps

1.  **Load Libraries**: `More Shapes > Networking > Cisco / Azure / AWS` (or standard "General").
2.  **Set Page Setup**: A4 or Letter, Portrait/Landscape.
3.  **Draw Backbone**: Place Core devices first.
4.  **Connect**: Use "Waypoints" to make orthogonal lines.
5.  **Annotate**: Add text labels. Use LaTeX for math/formulas if needed (`Extras > Mathematical Typesetting`).
6.  **Export**:
    *   Format: **PDF** or **SVG** (Vector is best for papers).
    *   "Crop": Select "Crop" to remove excess whitespace.
    *   "Transparent Background": Check if embedding in a colored poster, otherwise uncheck for papers.

## 6. Example IEEE Prompt for AI
When asking the AI to generate an IEEE-style diagram, specify:
> "Create an IEEE-standard network diagram for a campus network. Use orthogonal lines. Include Core, Distribution, and Access layers. Use standard symbols. Output in black and white compatible style."

## 7. Mathematical Annotations in Network Diagrams

For network diagrams requiring mathematical notation (throughput, latency, bandwidth calculations):

### 7.1 Common Network Formulas

Use LaTeX format for all mathematical expressions:

```latex
% Throughput
$$T = \frac{W}{RTT} \cdot \frac{1}{\sqrt{p}}$$

% Queuing delay (M/M/1)
$$D_q = \frac{\lambda}{\mu(\mu - \lambda)}$$

% Shannon capacity
$$C = B \log_2\left(1 + \frac{S}{N}\right)$$

% Link utilization
$$\rho = \frac{\lambda}{\mu}$$

% Packet loss probability
$$P_{loss} = \frac{\rho^K (1-\rho)}{1-\rho^{K+1}}$$
```

### 7.2 Label Examples for Network Components

| Component | Label Example |
|-----------|---------------|
| Link bandwidth | `\(B = 1\text{ Gbps}\)` |
| Propagation delay | `\(d_{prop} = \frac{L}{c}\)` |
| Buffer size | `\(Q_{max} = B \cdot RTT\)` |
| Traffic rate | `\(\lambda = 500\text{ pps}\)` |
| Service rate | `\(\mu = 1000\text{ pps}\)` |

### 7.3 Example: Network Performance Diagram

```
┌─────────────────┐     \(d = 10\text{ ms}\)     ┌─────────────────┐
│    Server       │ ──────────────────────────▶ │    Client       │
│ \(\mu = 1000\)  │     \(B = 100\text{ Mbps}\)  │ \(\lambda=500\) │
└─────────────────┘                              └─────────────────┘
                    $$T = \frac{MSS \cdot 8}{RTT \cdot \sqrt{p}}$$
```

### 7.4 Notation Consistency

For IEEE network papers, maintain consistent notation:

| Symbol | Meaning | LaTeX |
|--------|---------|-------|
| λ | Arrival rate | `\lambda` |
| μ | Service rate | `\mu` |
| ρ | Utilization | `\rho` |
| B | Bandwidth | `B` |
| D | Delay | `D` |
| C | Capacity | `C` |
| T | Throughput | `T` |
| RTT | Round-trip time | `\text{RTT}` |
| MSS | Max segment size | `\text{MSS}` |

## 8. Export Checklist for IEEE Submission

- [ ] All mathematical expressions use LaTeX format
- [ ] Figure has proper caption: "Fig. N. Description."
- [ ] Legend explains all symbols and line types
- [ ] Grayscale compatibility verified
- [ ] Vector format (PDF/SVG) used
- [ ] Excess whitespace cropped
- [ ] Font size matches journal requirements (8-10pt)
- [ ] Resolution ≥ 300 DPI for any rasterized elements
