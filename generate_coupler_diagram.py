import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(8.5, 5.5), dpi=300)
fig.patch.set_facecolor('#10222B')
ax.set_facecolor('#10222B')

w_box, h_box = 4.2, 3.0
x_left, x_right = -w_box/2, w_box/2
y_bot, y_top = -h_box/2, h_box/2

th_series = 0.24  # 35.4 ohm (5.3 mm) -> series vertical arms
th_shunt = 0.14   # 50 ohm (3.0 mm) -> shunt horizontal arms

# Shunt arms (Horizontal, Teal #1B7F8C)
ax.add_patch(patches.Rectangle((x_left - th_series/2, y_bot - th_shunt/2), w_box + th_series, th_shunt, 
                               color='#1B7F8C', zorder=2))
ax.add_patch(patches.Rectangle((x_left - th_series/2, y_top - th_shunt/2), w_box + th_series, th_shunt, 
                               color='#1B7F8C', zorder=2))

# Series arms (Vertical, Coral #E05A47)
ax.add_patch(patches.Rectangle((x_left - th_series/2, y_bot - th_shunt/2), th_series, h_box + th_shunt, 
                               color='#E05A47', zorder=3))
ax.add_patch(patches.Rectangle((x_right - th_series/2, y_bot - th_shunt/2), th_series, h_box + th_shunt, 
                               color='#E05A47', zorder=3))

# Feed lines (Silver/Gray #CADCE0)
feed_len = 1.05
ax.plot([x_left, x_left - feed_len*0.7], [y_bot, y_bot - feed_len*0.7], color='#CADCE0', lw=4.5, zorder=1)
ax.plot([x_left, x_left - feed_len*0.7], [y_top, y_top + feed_len*0.7], color='#CADCE0', lw=4.5, zorder=1)
ax.plot([x_right, x_right + feed_len*0.7], [y_top, y_top + feed_len*0.7], color='#CADCE0', lw=4.5, zorder=1)
ax.plot([x_right, x_right + feed_len*0.7], [y_bot, y_bot - feed_len*0.7], color='#CADCE0', lw=4.5, zorder=1)

# Feed ports (Pins)
ax.scatter([x_left - feed_len*0.7], [y_bot - feed_len*0.7], color='#F59E0B', s=130, zorder=4, edgecolors='white', lw=1.5)
ax.scatter([x_left - feed_len*0.7], [y_top + feed_len*0.7], color='#10B981', s=130, zorder=4, edgecolors='white', lw=1.5)
ax.scatter([x_right + feed_len*0.7], [y_top + feed_len*0.7], color='#10B981', s=130, zorder=4, edgecolors='white', lw=1.5)
ax.scatter([x_right + feed_len*0.7], [y_bot - feed_len*0.7], color='#EF4444', s=130, zorder=4, edgecolors='white', lw=1.5)

# Port Labels
# P1: Input
ax.text(x_left - feed_len*0.75, y_bot - feed_len*0.75, "Port 1 (Input)\nExcitation (0 dB, ∠0°)", 
        color='#FFFFFF', fontsize=10.5, fontweight='bold', ha='right', va='top')
# P2: Through
ax.text(x_left - feed_len*0.75, y_top + feed_len*0.75, "Port 2 (Through)\n-3 dB,  ∠-90°", 
        color='#34D399', fontsize=10.5, fontweight='bold', ha='right', va='bottom')
# P3: Coupled
ax.text(x_right + feed_len*0.75, y_top + feed_len*0.75, "Port 3 (Coupled)\n-3 dB,  ∠-180°\n[ΔΦ = 90° vs Through]", 
        color='#34D399', fontsize=10.5, fontweight='bold', ha='left', va='bottom')
# P4: Isolated
ax.text(x_right + feed_len*0.75, y_bot - feed_len*0.75, "Port 4 (Isolated)\n180° Path Cancellation\n(S41 ≈ 0, Infinite RL)", 
        color='#F87171', fontsize=10.5, fontweight='bold', ha='left', va='top')

# Arm Dimensions & Impedances
# Series arms (Vertical)
ax.text(x_left - 0.22, 0, "Series Arm\n35.4 Ω (5.3 mm)\nλg/4 ≈ 16.7 mm", 
        color='#E05A47', fontsize=9, fontweight='bold', ha='right', va='center')
ax.text(x_right + 0.22, 0, "Series Arm\n35.4 Ω (5.3 mm)\nλg/4 ≈ 16.7 mm", 
        color='#E05A47', fontsize=9, fontweight='bold', ha='left', va='center')

# Shunt arms (Horizontal)
ax.text(0, y_bot - 0.32, "Shunt Arm: 50 Ω (3.0 mm), λg/4 ≈ 17.1 mm", 
        color='#38BDF8', fontsize=9, fontweight='bold', ha='center', va='top')
ax.text(0, y_top + 0.32, "Shunt Arm: 50 Ω (3.0 mm), λg/4 ≈ 17.1 mm", 
        color='#38BDF8', fontsize=9, fontweight='bold', ha='center', va='bottom')

# Center Box
ax.text(0, 0, "QUADRATURE HYBRID (90°)\n• Power Split: -3.01 dB each\n• Phase Difference: ΔΦ = 90°\n• Cancellation at P4: Δθ = 180°", 
        color='#CADCE0', fontsize=9.5, ha='center', va='center',
        bbox=dict(boxstyle='round,pad=0.6', facecolor='#0B3C49', edgecolor='#5E9C8F', alpha=0.95, lw=1.2))

ax.set_xlim(-3.8, 3.8)
ax.set_ylim(-2.7, 2.7)
ax.axis('off')
plt.tight_layout()
plt.savefig('coupler_diagram_corrected.png', facecolor=fig.get_facecolor(), edgecolor='none', dpi=300)
print('Updated coupler_diagram_corrected.png')
