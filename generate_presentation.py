import os
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# --- Color Palette (Dark High-Tech RF Engineering Theme) ---
COLOR_BG = RGBColor(0x10, 0x22, 0x2B)         # Dark Teal/Navy (#10222B)
COLOR_CARD = RGBColor(0x0E, 0x2C, 0x38)       # Slightly lighter container (#0E2C38)
COLOR_CARD_BORDER = RGBColor(0x1B, 0x7F, 0x8C) # Cyan/Teal border
COLOR_TEXT_WHITE = RGBColor(0xFF, 0xFF, 0xFF)
COLOR_TEXT_MUTED = RGBColor(0xCA, 0xDC, 0xE0) # Soft silver/blue
COLOR_ACCENT_CYAN = RGBColor(0x38, 0xBD, 0xF8) # Bright cyan
COLOR_ACCENT_TEAL = RGBColor(0x1B, 0x7F, 0x8C) # Darker teal
COLOR_ACCENT_ORANGE = RGBColor(0xF5, 0x9E, 0x0B) # Amber/Gold
COLOR_ACCENT_CORAL = RGBColor(0xEF, 0x44, 0x44)  # Coral/Red
COLOR_ACCENT_GREEN = RGBColor(0x10, 0xB9, 0x81)  # Emerald green

FONT_HEADING = 'Calibri'
FONT_BODY = 'Calibri'

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(10.0)
    prs.slide_height = Inches(5.625) # 16:9 widescreen
    blank_layout = prs.slide_layouts[6] # blank layout

    def set_slide_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = COLOR_BG

    def add_header(slide, title_text, chip_text=""):
        # Header Chip (Category pill)
        if chip_text:
            chip_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.6), Inches(0.35), Inches(1.8), Inches(0.28))
            chip_box.fill.solid()
            chip_box.fill.fore_color.rgb = COLOR_CARD
            chip_box.line.color.rgb = COLOR_ACCENT_CYAN
            chip_box.line.width = Pt(1.0)
            tf = chip_box.text_frame
            tf.word_wrap = False
            tf.vertical_anchor = MSO_ANCHOR.MIDDLE
            p = tf.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER
            run = p.add_run()
            run.text = chip_text.upper()
            run.font.name = FONT_BODY
            run.font.size = Pt(8.5)
            run.font.bold = True
            run.font.color.rgb = COLOR_ACCENT_CYAN

        # Title text
        top_pos = Inches(0.65) if chip_text else Inches(0.4)
        title_box = slide.shapes.add_textbox(Inches(0.6), top_pos, Inches(8.8), Inches(0.55))
        tf = title_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        run = p.add_run()
        run.text = title_text
        run.font.name = FONT_HEADING
        run.font.size = Pt(20)
        run.font.bold = True
        run.font.color.rgb = COLOR_TEXT_WHITE

    def add_card(slide, left, top, width, height, border_color=COLOR_CARD_BORDER, bg_color=COLOR_CARD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.0)
        return card

    def add_stat_box(slide, left, top, width, height, value_text, label_text, subnote="", value_color=COLOR_ACCENT_CYAN):
        card = add_card(slide, left, top, width, height, border_color=COLOR_CARD_BORDER)
        tf = card.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tf.margin_left = tf.margin_right = Inches(0.12)
        tf.margin_top = tf.margin_bottom = Inches(0.08)
        
        p1 = tf.paragraphs[0]
        p1.alignment = PP_ALIGN.CENTER
        r1 = p1.add_run()
        r1.text = value_text
        r1.font.name = FONT_HEADING
        r1.font.size = Pt(20)
        r1.font.bold = True
        r1.font.color.rgb = value_color
        
        p2 = tf.add_paragraph()
        p2.alignment = PP_ALIGN.CENTER
        r2 = p2.add_run()
        r2.text = label_text
        r2.font.name = FONT_BODY
        r2.font.size = Pt(9.5)
        r2.font.bold = True
        r2.font.color.rgb = COLOR_TEXT_WHITE
        
        if subnote:
            p3 = tf.add_paragraph()
            p3.alignment = PP_ALIGN.CENTER
            r3 = p3.add_run()
            r3.text = subnote
            r3.font.name = FONT_BODY
            r3.font.size = Pt(8.0)
            r3.font.color.rgb = COLOR_TEXT_MUTED
        return card

    def add_bullet_card(slide, left, top, width, height, title, bullets, title_color=COLOR_ACCENT_CYAN):
        card = add_card(slide, left, top, width, height)
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = Inches(0.2)
        tf.margin_top = tf.margin_bottom = Inches(0.15)
        
        p0 = tf.paragraphs[0]
        r0 = p0.add_run()
        r0.text = title
        r0.font.name = FONT_HEADING
        r0.font.size = Pt(13)
        r0.font.bold = True
        r0.font.color.rgb = title_color
        
        for b in bullets:
            p = tf.add_paragraph()
            p.space_before = Pt(4)
            p.level = 0
            r = p.add_run()
            r.text = "•  " + b
            r.font.name = FONT_BODY
            r.font.size = Pt(9.5)
            r.font.color.rgb = COLOR_TEXT_MUTED
        return card

    def add_table_styled(slide, left, top, width, height, headers, rows):
        table_shape = slide.shapes.add_table(len(rows) + 1, len(headers), left, top, width, height)
        table = table_shape.table
        
        # Style headers
        for col_idx, h in enumerate(headers):
            cell = table.cell(0, col_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = COLOR_ACCENT_TEAL
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            p = cell.text_frame.paragraphs[0]
            p.alignment = PP_ALIGN.CENTER
            r = p.add_run()
            r.text = h
            r.font.name = FONT_HEADING
            r.font.size = Pt(9.5)
            r.font.bold = True
            r.font.color.rgb = COLOR_TEXT_WHITE
            
        # Style rows
        for row_idx, row in enumerate(rows):
            bg_c = COLOR_CARD if row_idx % 2 == 0 else RGBColor(0x13, 0x36, 0x44)
            for col_idx, val in enumerate(row):
                cell = table.cell(row_idx + 1, col_idx)
                cell.fill.solid()
                cell.fill.fore_color.rgb = bg_c
                cell.vertical_anchor = MSO_ANCHOR.MIDDLE
                p = cell.text_frame.paragraphs[0]
                p.alignment = PP_ALIGN.CENTER if col_idx > 0 else PP_ALIGN.LEFT
                r = p.add_run()
                r.text = str(val)
                r.font.name = FONT_BODY
                r.font.size = Pt(8.5)
                r.font.color.rgb = COLOR_TEXT_WHITE if col_idx == 0 else COLOR_TEXT_MUTED
        return table_shape

    # =========================================================================
    # SLIDE 1: Title Slide
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)
    
    # Title badge
    c_badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.6), Inches(4.2), Inches(0.35))
    c_badge.fill.solid()
    c_badge.fill.fore_color.rgb = COLOR_CARD
    c_badge.line.color.rgb = COLOR_ACCENT_CYAN
    tf = c_badge.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = "MICROWAVE THEORY AND ANTENNA (23EC5PCMTA)"
    r.font.name = FONT_BODY
    r.font.size = Pt(9.5)
    r.font.bold = True
    r.font.color.rgb = COLOR_ACCENT_CYAN

    # Main Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.15), Inches(5.6), Inches(1.8))
    tf = t_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "Branch-Line Coupler &\nPrinted UWB Monopole"
    r.font.name = FONT_HEADING
    r.font.size = Pt(28)
    r.font.bold = True
    r.font.color.rgb = COLOR_TEXT_WHITE
    
    p2 = tf.add_paragraph()
    p2.space_before = Pt(8)
    r2 = p2.add_run()
    r2.text = "Design, 3D EM Simulation, and Performance Characterization on 1.6 mm FR4"
    r2.font.name = FONT_BODY
    r2.font.size = Pt(12)
    r2.font.color.rgb = COLOR_TEXT_MUTED

    # Team & Instructor Box
    meta_card = add_card(s1, Inches(0.8), Inches(3.3), Inches(5.6), Inches(1.7), border_color=COLOR_CARD_BORDER)
    tf = meta_card.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(0.2)
    tf.margin_top = Inches(0.12)
    
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = "Team 1 — Electronics & Communication Engineering"
    r.font.name = FONT_HEADING
    r.font.size = Pt(10.5)
    r.font.bold = True
    r.font.color.rgb = COLOR_ACCENT_CYAN
    
    p = tf.add_paragraph()
    r = p.add_run()
    r.text = "Nabi Abhishikth Zacharias (1BF24EC086)  |  Ratik Agrawal (1BF24EC118)\nRohit Nair (1BF24EC121)  |  Sawan Kumar (1BF24EC136)"
    r.font.name = FONT_BODY
    r.font.size = Pt(9)
    r.font.color.rgb = COLOR_TEXT_WHITE
    
    p = tf.add_paragraph()
    p.space_before = Pt(6)
    r = p.add_run()
    r.text = "Course Instructor: Dr. Shaila V. Hegde, Professor in ECE\nB.M.S. College of Engineering, Bengaluru  |  June 2026"
    r.font.name = FONT_BODY
    r.font.size = Pt(8.5)
    r.font.color.rgb = COLOR_TEXT_MUTED

    # Right side visual previews
    if os.path.exists('coupler_diagram_corrected.png'):
        s1.shapes.add_picture('coupler_diagram_corrected.png', Inches(6.7), Inches(0.7), Inches(2.7), Inches(2.0))
    if os.path.exists('extracted_media/word/media/fig1B.png'):
        s1.shapes.add_picture('extracted_media/word/media/fig1B.png', Inches(6.7), Inches(2.9), Inches(2.7), Inches(2.1))

    s1.notes_slide.notes_text_frame.text = (
        "Good morning/afternoon respected Professor and colleagues. "
        "We are Team 1, presenting our work on Microwave Theory and Antenna: "
        "Part A covers the design and characterization of a 2.4 GHz microstrip Branch-Line Coupler, "
        "and Part B covers a printed Ultra-Wideband (UWB) Monopole Antenna on 1.6 mm FR4 substrate using Ansys HFSS."
    )

    # =========================================================================
    # SLIDE 2: Project Overview & Scope
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "Project Overview & Methodology", "EXECUTIVE SUMMARY")

    add_bullet_card(s2, Inches(0.6), Inches(1.3), Inches(4.2), Inches(3.8),
                    "Part A: 2.4 GHz Branch-Line Coupler",
                    [
                        "Function: Equal power division (-3 dB split) with 90° quadrature phase shift.",
                        "Substrate: 1.6 mm FR4 (εr = 4.4, tan δ = 0.02) for 2.4 GHz ISM band.",
                        "Architecture: Closed ring of 4 quarter-wave microstrip arms (50 Ω shunt, 35.4 Ω series).",
                        "Key Objectives: Verify port match (S11), isolation (S41), power division (S21, S31), and ~10% fractional bandwidth.",
                        "Methodology: Hammerstad synthesis -> 3D HFSS Terminal Network sweep (1.2–3.6 GHz)."
                    ], title_color=COLOR_ACCENT_ORANGE)

    add_bullet_card(s2, Inches(5.2), Inches(1.3), Inches(4.2), Inches(3.8),
                    "Part B: Planar Printed UWB Monopole",
                    [
                        "Function: Ultra-wideband planar transmission/reception across multiple GHz.",
                        "Target Spectrum: FCC unlicensed UWB mask (3.1 to 10.6 GHz; FBW ≥ 20%).",
                        "Architecture: Circular disc radiator fed by 50 Ω microstrip with partial ground plane on reverse.",
                        "Physics: Smooth tapered transition from feed line to free space supporting multi-modal resonance.",
                        "Key Objectives: Characterize S11 impedance bandwidth (1–15 GHz) and 2D/3D realized gain at 5 GHz."
                    ], title_color=COLOR_ACCENT_CYAN)

    s2.notes_slide.notes_text_frame.text = (
        "This project is divided into two distinct microwave components designed on standard 1.6 mm FR4 epoxy substrate. "
        "Part A focuses on a narrowband 2.4 GHz quadrature directional coupler, while Part B investigates an ultra-wideband printed disc monopole antenna. "
        "We followed an end-to-end engineering workflow: theoretical synthesis from closed-form equations, 3D electromagnetic modeling in Ansys HFSS, "
        "and rigorous post-processing of S-parameters and radiation fields."
    )

    # =========================================================================
    # SLIDE 3: Part A — Operating Principle & Verified Port Mapping
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "Operating Principle & Port Architecture", "PART A | COUPLER")

    # Add corrected coupler diagram
    if os.path.exists('coupler_diagram_corrected.png'):
        s3.shapes.add_picture('coupler_diagram_corrected.png', Inches(0.55), Inches(1.35), Inches(4.5), Inches(3.7))

    # Analytical explanation cards
    add_bullet_card(s3, Inches(5.2), Inches(1.35), Inches(4.3), Inches(1.8),
                    "Quadrature Hybrid Operation (f0 = 2.4 GHz)",
                    [
                        "Through Port (P2): -3 dB power split with -90° phase shift relative to input.",
                        "Coupled Port (P3): -3 dB power split with -180° phase shift relative to input.",
                        "Output Phase Difference: ΔΦ = (-180°) - (-90°) = 90° (True Quadrature Hybrid)."
                    ], title_color=COLOR_ACCENT_GREEN)

    add_bullet_card(s3, Inches(5.2), Inches(3.25), Inches(4.3), Inches(1.8),
                    "Destructive Interference at Isolated Port (P4)",
                    [
                        "Path A (Direct Shunt Arm): Travels λg/4 -> Phase delay = 90°.",
                        "Path B (Around the Ring): Travels 3λg/4 -> Phase delay = 270°.",
                        "Phase Difference: Δθ = 270° - 90° = 180° -> Exact signal cancellation (S41 ≈ 0).",
                        "Crucial Distinction: 180° is the cancellation at P4, NOT the output phase split!"
                    ], title_color=COLOR_ACCENT_CORAL)

    s3.notes_slide.notes_text_frame.text = (
        "Here is the fundamental operation of the branch-line coupler, and we highlight an important technical clarification: "
        "The two output ports—Port 2 (Through) and Port 3 (Coupled)—exhibit a 90° relative phase difference, making it a 90° quadrature hybrid. "
        "The 180° phase difference described in microwave theory refers specifically to the two paths arriving at Port 4 (the isolated port), "
        "where Path A (90°) and Path B (270°) arrive exactly 180° out of phase, destructively interfering to provide high isolation. "
        "Furthermore, our physical HFSS geometry matches this mapping: vertical series arms (35.4 Ω) join P1 to P2 and P4 to P3, "
        "while horizontal shunt arms (50 Ω) join P1 to P4 and P2 to P3."
    )

    # =========================================================================
    # SLIDE 4: Part A — Microstrip Synthesis & Dimensions
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "Microstrip Synthesis & Design Parameters", "PART A | COUPLER")

    # 4 Quick Stat Cards
    add_stat_box(s4, Inches(0.6), Inches(1.3), Inches(2.0), Inches(1.1), "3.0 mm", "50 Ω Shunt Arms", "Synthesized: 3.06 mm (Z=50.8 Ω)")
    add_stat_box(s4, Inches(2.8), Inches(1.3), Inches(2.0), Inches(1.1), "5.3 mm", "35.4 Ω Series Arms", "Z0/√2 target (Z=35.1 Ω)")
    add_stat_box(s4, Inches(5.0), Inches(1.3), Inches(2.0), Inches(1.1), "17.1 mm", "λg/4 (50 Ω Line)", "λg = 68.6 mm, εeff = 3.32")
    add_stat_box(s4, Inches(7.2), Inches(1.3), Inches(2.2), Inches(1.1), "16.7 mm", "λg/4 (35.4 Ω Line)", "λg = 66.9 mm, εeff = 3.49")

    # Synthesis Table
    headers = ["Arm Parameter", "50 Ω Shunt Arm", "35.4 Ω Series Arm", "Synthesis / HFSS Remarks"]
    rows = [
        ["Target Impedance", "50.0 Ω", "35.35 Ω (Z0/√2)", "Equal power division condition"],
        ["Synthesized Width (w)", "3.06 mm (w/h = 1.91)", "5.30 mm (w/h = 3.31)", "Derived via Hammerstad equations"],
        ["HFSS Width Used", "3.00 mm (Z0 = 50.8 Ω)", "5.30 mm (Z0 = 35.1 Ω)", "Both within 1.6% of theoretical target"],
        ["Effective Permittivity (εeff)", "3.32", "3.49", "Mixed dielectric boundary (air + FR4)"],
        ["Quarter Wavelength (λg/4)", "17.1 mm", "16.7 mm", "Design frequency f0 = 2.4 GHz"],
        ["Substrate & Dielectric Loss", "FR4 (εr = 4.4, h = 1.6 mm)", "tan δ = 0.02 (αd ≈ 0.83 Np/m)", "Predicts ~0.5 dB loss per guided wavelength"]
    ]
    add_table_styled(s4, Inches(0.6), Inches(2.6), Inches(8.8), Inches(2.5), headers, rows)

    s4.notes_slide.notes_text_frame.text = (
        "Slide 4 summarizes the microstrip synthesis using Hammerstad closed-form design equations on 1.6 mm FR4 epoxy (εr = 4.4). "
        "The 50 Ω feed and shunt arms use a width of 3.0 mm (giving 50.8 Ω, within 1.6% of target), with a quarter-wavelength of 17.1 mm. "
        "The 35.4 Ω series arms require a wider 5.3 mm strip (giving 35.1 Ω, within 0.8% of target), with a quarter-wavelength of 16.7 mm. "
        "We also calculated dielectric attenuation of 0.83 Np/m (7.2 dB/m), indicating we should expect roughly 0.5 dB of insertion loss "
        "in the coupler due to lossy FR4 substrate."
    )

    # =========================================================================
    # SLIDE 5: Part A — 3D HFSS Model & Simulation Setup
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "HFSS 3D EM Simulation Setup", "PART A | COUPLER")

    # Visuals: Top view & 3D view
    if os.path.exists('extracted_media/word/media/fig2.jpg'):
        s5.shapes.add_picture('extracted_media/word/media/fig2.jpg', Inches(0.6), Inches(1.35), Inches(2.8), Inches(2.2))
    if os.path.exists('extracted_media/word/media/fig4.jpg'):
        s5.shapes.add_picture('extracted_media/word/media/fig4.jpg', Inches(3.6), Inches(1.35), Inches(3.0), Inches(2.2))

    # Details card on right
    add_bullet_card(s5, Inches(6.8), Inches(1.35), Inches(2.6), Inches(3.8),
                    "Model & Boundary Setup",
                    [
                        "Project: Branch_line_coupler",
                        "Solution: HFSS Terminal Network",
                        "Conductors: Zero-thickness Perfect E sheets (ground + ring).",
                        "Substrate: Lossy FR4 (30 × 40 × 1.6 mm).",
                        "Air Box: 50 × 50 × 50 mm vacuum box with Radiation Boundary.",
                        "Excitations: 4 lumped ports (50 Ω) placed at board edges.",
                        "Adaptive Setup: 2.4 GHz, 6 passes, ΔS ≤ 0.02.",
                        "Frequency Sweep: 1.2 to 3.6 GHz (6 MHz step, 401 points)."
                    ], title_color=COLOR_ACCENT_CYAN)

    # Port coordinates table below images
    headers_port = ["Port #", "HFSS Role", "Coordinates (x, y)", "Connected Branch"]
    rows_port = [
        ["Port 1", "Input Port", "x = -8.55 mm, y = -20 mm", "Excitation feed line"],
        ["Port 2", "Through Port", "x = -8.55 mm, y = +20 mm", "5.3 mm (35.4 Ω) vertical series arm"],
        ["Port 3", "Coupled Port", "x = +8.55 mm, y = +20 mm", "Diagonal corner (quadrature output)"],
        ["Port 4", "Isolated Port", "x = +8.55 mm, y = -20 mm", "3.0 mm (50.0 Ω) horizontal shunt arm"]
    ]
    add_table_styled(s5, Inches(0.6), Inches(3.7), Inches(6.0), Inches(1.5), headers_port, rows_port)

    s5.notes_slide.notes_text_frame.text = (
        "Here we show the actual Ansys HFSS simulation environment. The solution type is HFSS Terminal Network. "
        "The model dimensions are 30 by 40 mm with 4 lumped ports placed on the substrate perimeter. "
        "The table confirms the exact port assignments verified directly from the HFSS .aedt project file: "
        "Port 1 is the bottom-left input; Port 2 is the top-left through port connected via the 5.3 mm series arm; "
        "Port 3 is the top-right coupled port; and Port 4 is the bottom-right isolated port connected via the 50 Ω shunt arm. "
        "The sweep runs from 1.2 GHz to 3.6 GHz with an adaptive solution converged to ΔS < 0.02."
    )

    # =========================================================================
    # SLIDE 6: Part A — S-Parameter Results & Quantitative Evaluation
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Simulated S-Parameters & Performance", "PART A | COUPLER")

    # Visual: Marker plot
    if os.path.exists('extracted_media/word/media/fig6.jpg'):
        s6.shapes.add_picture('extracted_media/word/media/fig6.jpg', Inches(0.6), Inches(1.35), Inches(4.5), Inches(2.6))

    # Stat cards on right
    add_stat_box(s6, Inches(5.3), Inches(1.35), Inches(2.0), Inches(1.2), "2.42 GHz", "Centre Frequency", "+0.8% offset from 2.4 GHz", COLOR_ACCENT_GREEN)
    add_stat_box(s6, Inches(7.4), Inches(1.35), Inches(2.0), Inches(1.2), "27 to 44 dB", "Return Loss & Isolation", "VSWR ≤ 1.09 (m1 = -44.2 dB)", COLOR_ACCENT_GREEN)
    add_stat_box(s6, Inches(5.3), Inches(2.7), Inches(2.0), Inches(1.2), "-3.57 dB", "Power Split (m3)", "At 2.346 GHz (ideal -3.01 dB)", COLOR_ACCENT_ORANGE)
    add_stat_box(s6, Inches(7.4), Inches(2.7), Inches(2.0), Inches(1.2), "≈ 10 %", "20 dB Bandwidth", "2.30 to 2.55 GHz (~250 MHz)", COLOR_ACCENT_CYAN)

    # Marker Reading Table below
    headers_m = ["Marker", "Frequency", "Magnitude (dB)", "|S| or |Γ|", "VSWR", "Physical Trace Role"]
    rows_m = [
        ["m1", "2.424 GHz", "-44.16 dB", "0.0062", "1.01", "Port 4 Isolation Dip (dB(S(1,4))) — Excellent isolation"],
        ["m2", "2.418 GHz", "-40.40 dB", "0.0095", "1.02", "Port 1 Input Reflection Dip (dB(S(1,1))) — Near-perfect match"],
        ["m4, m5", "2.418 GHz", "-30.5 to -27.4 dB", "0.030–0.043", "1.06–1.09", "Additional port matching / cross-coupling minima"],
        ["m3*", "2.346 GHz", "-3.57 dB", "0.663", "—", "Power-split output trace (Through/Coupled); loss ~0.56 dB vs ideal"]
    ]
    add_table_styled(s6, Inches(0.6), Inches(4.05), Inches(8.8), Inches(1.2), headers_m, rows_m)

    s6.notes_slide.notes_text_frame.text = (
        "Slide 6 presents the simulated S-parameter results. "
        "Notice that the simulated centre frequency occurs at 2.42 GHz, which is only 0.8% above the 2.4 GHz target. "
        "This minor shift is standard in planar microwave circuits due to junction discontinuities and fringing fields at the 4 T-junction corners. "
        "At the centre, return loss and isolation range from 27 dB to over 44 dB (VSWR below 1.09). "
        "Crucially, marker m3 measures -3.57 dB on the power-split curve at 2.346 GHz—this is 0.56 dB below ideal (-3.01 dB), "
        "which perfectly matches our predicted FR4 dielectric loss of ~0.5 dB per guided wavelength. "
        "The 20 dB bandwidth is approximately 10% (2.3 to 2.55 GHz)."
    )

    # =========================================================================
    # SLIDE 7: Part A — Limitations & Practical Considerations
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "Discussion & Engineering Limitations", "PART A | COUPLER")

    add_bullet_card(s7, Inches(0.6), Inches(1.35), Inches(4.2), Inches(3.8),
                    "Validation & Physical Insights",
                    [
                        "Narrowband Behavior: The branch-line coupler relies on quarter-wave interference; matching degrades to 8 dB at 1.2 and 3.6 GHz.",
                        "Frequency Adjustment: Extending arm lengths by ~0.8% (0.15 mm) would pull the resonant centre from 2.42 GHz to exactly 2.40 GHz.",
                        "FR4 Loss Impact: Dielectric loss tangent (tan δ = 0.02) drops transmission from ideal -3.01 dB to -3.57 dB; high-frequency Rogers substrate would recover ~0.4 dB.",
                        "Symmetry & Split Balance: Minor asymmetry in layout causes slight split difference between through and coupled curves."
                    ], title_color=COLOR_ACCENT_CYAN)

    add_bullet_card(s7, Inches(5.2), Inches(1.35), Inches(4.2), Inches(3.8),
                    "Technical Limitations & Boundaries",
                    [
                        "Purely Simulated: Coupler performance is characterized in HFSS; physical fabrication and VNA measurement are future work.",
                        "Phase Verification: The 90° output phase difference is theoretically proven; HFSS phase traces (ang_deg) were not included in standard magnitude plots.",
                        "Conductor Loss: Modeled with Perfect E boundary (infinite conductivity); real copper roughness will introduce an additional ~0.1–0.2 dB loss.",
                        "Junction Parasitics: Simple synthesis ignores T-junction reactance; mitered or chamfered bends could further improve return loss."
                    ], title_color=COLOR_ACCENT_ORANGE)

    s7.notes_slide.notes_text_frame.text = (
        "To maintain rigorous engineering honesty, we explicitly detail the limitations of this analysis: "
        "First, this coupler has been simulated in Ansys HFSS, not experimentally measured on physical hardware. "
        "Second, while the 90° quadrature phase shift is guaranteed by branch-line symmetry, the supplied S-parameter plots depict magnitude (dB), "
        "so the phase angle was not directly plotted. "
        "Third, conductors were modeled as Perfect E sheets, so only substrate loss was captured. "
        "In physical hardware, copper surface roughness would add another tenth of a dB of attenuation."
    )

    # =========================================================================
    # SLIDE 8: Part B — UWB Monopole Fundamentals & Theory
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "UWB Fundamentals & Antenna Operating Principle", "PART B | ANTENNA")

    # Target regulatory stat cards
    add_stat_box(s8, Inches(0.6), Inches(1.3), Inches(2.7), Inches(1.15), "3.1 to 10.6 GHz", "FCC UWB Allocated Mask", "Unlicensed civilian UWB spectrum", COLOR_ACCENT_CYAN)
    add_stat_box(s8, Inches(3.6), Inches(1.3), Inches(2.7), Inches(1.15), "FBW ≥ 20 %", "FCC UWB Definition", "Or absolute BW ≥ 500 MHz", COLOR_ACCENT_GREEN)
    add_stat_box(s8, Inches(6.6), Inches(1.3), Inches(2.8), Inches(1.15), "> 3 : 1 Ratio", "Frequency Span", "High multi-octave bandwidth challenge", COLOR_ACCENT_ORANGE)

    # Theoretical Cards
    add_bullet_card(s8, Inches(0.6), Inches(2.65), Inches(4.2), Inches(2.55),
                    "Why a Printed Disc Monopole?",
                    [
                        "Tapered Impedance Transition: The smooth curved circular disc acts like a continuous impedance taper from the 50 Ω feed line to free space.",
                        "Merged Resonances: Rather than a single sharp quarter-wave resonance, the disc excites multiple adjacent resonant modes that overlap into an ultra-wide band.",
                        "Partial Ground Plane: The ground plane is truncated underneath the feed line, keeping the radiator unshielded and matching impedance."
                    ], title_color=COLOR_ACCENT_CYAN)

    add_bullet_card(s8, Inches(5.2), Inches(2.65), Inches(4.2), Inches(2.55),
                    "Design Relations & Cut-off Estimate",
                    [
                        "First-Order Lower Cut-off: Determined by longest current path L from ground edge to radiator tip: fL ≈ c / (4 L √εeff).",
                        "Effective Permittivity: εeff ≈ (εr + 1)/2 ≈ (4.4 + 1)/2 = 2.7.",
                        "Theoretical Calculation: For L = 14.5 mm, fL ≈ 3.15 GHz (very close to FCC 3.1 GHz edge).",
                        "Impedance Criterion: S11 ≤ -10 dB (VSWR ≤ 1.92, |Γ| ≤ 0.316, ≤10% reflected power)."
                    ], title_color=COLOR_ACCENT_GREEN)

    s8.notes_slide.notes_text_frame.text = (
        "Now moving to Part B: the printed Ultra-Wideband Monopole Antenna. "
        "We first clarify the regulatory context: the FCC defines UWB as any signal with fractional bandwidth over 20% or absolute bandwidth over 500 MHz, "
        "and designated 3.1 to 10.6 GHz for unlicensed operation. "
        "A conventional wire monopole is narrowband, but a printed circular disc acts as a continuous impedance taper from 50 Ω to 377 Ω free space. "
        "Using the longest current path L = 14.5 mm from the edge of the partial ground to the radiator apex, "
        "the first-order quarter-wave relation predicts a lower cut-off frequency fL of approximately 3.15 GHz."
    )

    # =========================================================================
    # SLIDE 9: Part B — Antenna Geometry & HFSS Model Setup
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background(s9)
    add_header(s9, "Antenna Geometry & 3D Simulation Setup", "PART B | ANTENNA")

    # Visual: fig1B schematic
    if os.path.exists('extracted_media/word/media/fig1B.png'):
        s9.shapes.add_picture('extracted_media/word/media/fig1B.png', Inches(0.6), Inches(1.35), Inches(4.4), Inches(3.8))

    # Dimensions & Setup tables on right
    headers_dim = ["Antenna Feature", "Dimensions", "Physical Role"]
    rows_dim = [
        ["Substrate", "26 × 27 × 1.6 mm", "FR4 epoxy (εr = 4.4, tan δ = 0.02)"],
        ["Disc Radiator", "Radius R = 13 mm", "Centered at x = -12 mm, truncated at edge"],
        ["Feed Line", "3.0 mm × 13 mm", "50 Ω microstrip feed (x = 0 to +13 mm)"],
        ["Partial Ground", "11.5 mm × 27 mm", "Bottom face (x = 1.5 to 13 mm)"],
        ["Excitation", "Lumped Port (3 × 1.6 mm)", "50 Ω port at substrate edge (x = 13 mm)"],
        ["Air Box", "40 × 40 × 40 mm", "Radiation boundary (Setup1 at 5 GHz)"],
        ["Frequency Sweep", "1 to 15 GHz", "141 points (100 MHz step)"]
    ]
    add_table_styled(s9, Inches(5.2), Inches(1.35), Inches(4.2), Inches(3.8), headers_dim, rows_dim)

    s9.notes_slide.notes_text_frame.text = (
        "Slide 9 illustrates the antenna geometry modeled in HFSS. "
        "The board is remarkably compact: just 26 mm by 27 mm on 1.6 mm FR4. "
        "On the top layer, a 3 mm wide microstrip line feeds a circular disc of radius 13 mm. "
        "On the bottom layer, the ground plane is truncated to a length of 11.5 mm, leaving a 1.5 mm gap before the disc. "
        "This partial ground is essential for achieving broad impedance matching. "
        "The model was excited with a lumped port and swept from 1 GHz to 15 GHz with adaptive meshing solved at 5 GHz."
    )

    # =========================================================================
    # SLIDE 10: Part B — Reflection Coefficient & Bandwidth Evaluation
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background(s10)
    add_header(s10, "Impedance Matching & Bandwidth Analysis", "PART B | ANTENNA")

    # Visuals: S11 plot & FCC comparison bar
    if os.path.exists('extracted_media/word/media/fig2B.jpg'):
        s10.shapes.add_picture('extracted_media/word/media/fig2B.jpg', Inches(0.6), Inches(1.35), Inches(4.3), Inches(2.2))
    if os.path.exists('extracted_media/word/media/fig3B.png'):
        s10.shapes.add_picture('extracted_media/word/media/fig3B.png', Inches(0.6), Inches(3.7), Inches(4.3), Inches(1.4))

    # Stat Callouts on right
    add_stat_box(s10, Inches(5.1), Inches(1.35), Inches(2.1), Inches(1.1), "10.39 GHz", "Absolute Bandwidth", "3.52 to 13.91 GHz (S11 ≤ -10 dB)", COLOR_ACCENT_CYAN)
    add_stat_box(s10, Inches(7.35), Inches(1.35), Inches(2.1), Inches(1.1), "119 %", "Fractional BW", "fc = 8.71 GHz (FCC req: ≥20%)", COLOR_ACCENT_GREEN)
    add_stat_box(s10, Inches(5.1), Inches(2.6), Inches(2.1), Inches(1.1), "3.95 : 1", "Bandwidth Ratio", "fH / fL (Multi-octave)", COLOR_ACCENT_CYAN)
    add_stat_box(s10, Inches(7.35), Inches(2.6), Inches(2.1), Inches(1.1), "1.93", "VSWR at Band Edges", "Matches ≤ 10% reflected power", COLOR_ACCENT_GREEN)

    # Qualified Coverage Card
    add_bullet_card(s10, Inches(5.1), Inches(3.85), Inches(4.35), Inches(1.35),
                    "Critical Assessment vs FCC UWB Mask",
                    [
                        "Achieved Coverage: 3.52 to 10.6 GHz of the FCC band (and up to 13.91 GHz).",
                        "Lower Band Gap: Antenna does NOT cover 3.1 to 3.52 GHz (~420 MHz missing).",
                        "Sensitivity Warning: S11 reaches -10.05 dB at 8.5–8.6 GHz (tight 0.05 dB margin)."
                    ], title_color=COLOR_ACCENT_ORANGE)

    s10.notes_slide.notes_text_frame.text = (
        "Here are the simulated return loss results for the antenna. "
        "The impedance bandwidth (|S11| ≤ -10 dB) extends continuously from 3.52 GHz (marker m1) all the way to 13.91 GHz (marker m2). "
        "This yields an extraordinary 10.39 GHz absolute bandwidth, an FBW of 119%, and a 3.95:1 bandwidth ratio. "
        "However, we highlight an essential qualification: the antenna does NOT cover the complete FCC unlicensed mask. "
        "It misses the lower 3.1 to 3.52 GHz window, and exhibits a shallow hump near 8.5 GHz where margin is only 0.05 dB. "
        "Lengthening the disc by roughly 1 to 2 mm would lower the edge to fully encompass 3.1 GHz."
    )

    # =========================================================================
    # SLIDE 11: Part B — Radiation Patterns & Realized Gain at 5 GHz
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background(s11)
    add_header(s11, "Radiation Characteristics & Gain at 5 GHz", "PART B | ANTENNA")

    # Visuals: 3D gain & 2D cuts
    if os.path.exists('extracted_media/word/media/fig4B.jpg'):
        s11.shapes.add_picture('extracted_media/word/media/fig4B.jpg', Inches(0.6), Inches(1.35), Inches(4.2), Inches(2.2))
    if os.path.exists('extracted_media/word/media/fig5B.jpg'):
        s11.shapes.add_picture('extracted_media/word/media/fig5B.jpg', Inches(0.6), Inches(3.65), Inches(4.2), Inches(1.5))

    # Stat cards on right
    add_stat_box(s11, Inches(5.1), Inches(1.35), Inches(2.1), Inches(1.1), "3.43 dB", "Peak Realized Gain", "At 5 GHz (broad red lobe)", COLOR_ACCENT_GREEN)
    add_stat_box(s11, Inches(7.35), Inches(1.35), Inches(2.1), Inches(1.1), "-31.3 dB", "Deepest Null", "Sharp null along board axis", COLOR_ACCENT_CORAL)
    add_stat_box(s11, Inches(5.1), Inches(2.6), Inches(2.1), Inches(1.1), "≈ -18 dB", "S11 at 5 GHz", "<1.6% reflected power", COLOR_ACCENT_CYAN)
    add_stat_box(s11, Inches(7.35), Inches(2.6), Inches(2.1), Inches(1.1), "Omni-H", "Azimuth Pattern", "Broad coverage for mobile nodes", COLOR_ACCENT_CYAN)

    add_bullet_card(s11, Inches(5.1), Inches(3.85), Inches(4.35), Inches(1.35),
                    "Radiation Insights & Limitations",
                    [
                        "φ = 90° Plane: Broad, nearly omnidirectional pattern (2–3 dB gain) ideal for mobile links.",
                        "φ = 0° Plane: Classic figure-eight dipole pattern with deep nulls at θ = ±90°.",
                        "Limitation: Pattern computed at 5 GHz only; dispersion/group delay unmeasured."
                    ], title_color=COLOR_ACCENT_CYAN)

    s11.notes_slide.notes_text_frame.text = (
        "Slide 11 evaluates the far-field radiation at 5 GHz, a representative mid-band UWB frequency. "
        "The peak realized gain reaches 3.43 dB, with S11 at -18 dB, representing under 1.6% reflected power. "
        "The 3D plot shows a characteristic doughnut-like monopole pattern that is almost uniformly red, indicating high coverage over space. "
        "In the azimuth φ = 90° cut, radiation is nearly omnidirectional with gain fluctuating between 2 and 3 dB. "
        "In the elevation φ = 0° cut, classic nulls appear along the feed axis. "
        "We note that group delay and pulse distortion remain important metrics to characterize in future work."
    )

    # =========================================================================
    # SLIDE 12: Summary & Comparative Synthesis
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background(s12)
    add_header(s12, "Summary & Comparative Design Synthesis", "CONCLUSION")

    # Comprehensive comparison table
    headers_comp = ["Design Metric", "Part A: Branch-Line Coupler", "Part B: UWB Monopole Antenna"]
    rows_comp = [
        ["Operating Function", "Equal 3 dB power split with 90° phase difference", "Planar ultra-wideband transmission & reception"],
        ["Target Frequency", "2.4 GHz (ISM band)", "3.1 to 10.6 GHz (FCC UWB unlicensed mask)"],
        ["Simulated Performance", "Centre: 2.42 GHz (+0.8%); RL/Iso: 27–44 dB; Split: -3.57 dB", "Band: 3.52 to 13.91 GHz (10.39 GHz BW, 119% FBW)"],
        ["VSWR Performance", "VSWR ≤ 1.09 at centre frequency", "VSWR ≤ 1.93 across entire 10.39 GHz band"],
        ["Radiation / Insertion Loss", "~0.56 dB substrate attenuation (due to FR4 tan δ)", "Peak realized gain: 3.43 dB at 5 GHz (omnidirectional)"],
        ["Target Compliance", "Meets target with minor +0.8% junction frequency shift", "Qualified: Meets UWB definition (FBW>20%), misses 3.1–3.52 GHz"],
        ["Primary Next Step", "Miter corners or add 0.15 mm to arm length for 2.40 GHz", "Lengthen disc by 1.5 mm to pull lower edge down to 3.1 GHz"]
    ]
    add_table_styled(s12, Inches(0.6), Inches(1.35), Inches(8.8), Inches(2.7), headers_comp, rows_comp)

    # Final qualified verdict card
    add_bullet_card(s12, Inches(0.6), Inches(4.2), Inches(8.8), Inches(1.05),
                    "Qualified Verdict & Future Road Map",
                    [
                        "Coupler successfully achieves 2.4 GHz quadrature operation in simulation; Antenna achieves 119% FBW but requires qualification regarding 3.1–3.52 GHz coverage.",
                        "Hardware Validation: Both designs were analyzed purely via 3D EM simulation; physical PCB milling, VNA S-parameter measurement, and anechoic chamber testing represent the essential next steps."
                    ], title_color=COLOR_ACCENT_GREEN)

    s12.notes_slide.notes_text_frame.text = (
        "In conclusion, we compare both RF components designed on 1.6 mm FR4. "
        "The branch-line coupler successfully met its 2.4 GHz target with 27 to 44 dB return loss and isolation, and a slight +0.8% offset. "
        "The printed monopole achieved a massive 119% fractional bandwidth, satisfying the UWB definition, but with the qualification that it covers 3.52 to 10.6 GHz, "
        "leaving a 420 MHz gap at the bottom of the FCC mask. "
        "Both designs are fully verified in HFSS 3D EM simulation, and the natural next phase is PCB fabrication and experimental VNA validation."
    )

    # =========================================================================
    # SLIDE 13: References
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background(s13)
    add_header(s13, "Key References", "DOCUMENTATION")

    refs = [
        "D. M. Pozar, Microwave Engineering, 4th ed. Hoboken, NJ: John Wiley & Sons, 2012, ch. 7 (Power Dividers and Directional Couplers).",
        "E. Hammerstad and O. Jensen, 'Accurate models for microstrip computer-aided design,' in IEEE MTT-S International Microwave Symposium Digest, Washington, DC, 1980, pp. 407–409.",
        "C. A. Balanis, Antenna Theory: Analysis and Design, 4th ed. Hoboken, NJ: John Wiley & Sons, 2016, ch. 2 & 14.",
        "Federal Communications Commission (FCC), 'Revision of Part 15 of the Commission’s Rules Regarding Ultra-Wideband Transmission Systems,' First Report and Order, ET Docket 98-153, FCC 02-48, Adopted Feb. 2002, Released Apr. 2002.",
        "Ansys, Inc., Ansys HFSS / Electronics Desktop Student 2025 R2 Documentation & Electromagnetic Solver Manual, Canonsburg, PA, 2025."
    ]

    add_bullet_card(s13, Inches(0.6), Inches(1.35), Inches(8.8), Inches(3.8),
                    "Standard Literature & Technical References",
                    refs, title_color=COLOR_ACCENT_CYAN)

    s13.notes_slide.notes_text_frame.text = (
        "Thank you for your time and attention. "
        "Our work is grounded in these standard microwave and antenna engineering references, including Pozar, Hammerstad, Balanis, and the FCC First Report and Order. "
        "We welcome any questions from the Professor and the audience."
    )

    # Save presentation
    output_filename = "MTA_AAT_Presentation_Enhanced.pptx"
    prs.save(output_filename)
    print(f"Successfully generated {output_filename} with {len(prs.slides)} slides!")

if __name__ == "__main__":
    create_presentation()

