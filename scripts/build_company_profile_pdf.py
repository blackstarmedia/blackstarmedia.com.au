#!/usr/bin/env python3
"""Generate the Black Star Media & Entertainment company-profile PDF.

Produces a branded, multi-page A4 PDF that mirrors the dark, cinematic look of
the website (black canvas, light-grey accent, editorial serif headings). The
output is committed to the repo so the site can serve it as a static download.

Usage:
    python3 scripts/build_company_profile_pdf.py

Requires: reportlab  (pip install reportlab)
"""

from pathlib import Path

from reportlab.lib.colors import Color, HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.styles import ParagraphStyle

# ---------------------------------------------------------------------------
# Brand palette (mirrors assets/css/styles.css)
# ---------------------------------------------------------------------------
BLACK = HexColor("#000000")
SURFACE = HexColor("#16181C")
WHITE = HexColor("#FFFFFF")
ACCENT = HexColor("#CBD0D8")        # brand accent — light grey
MUTED = HexColor("#9AA0A6")         # secondary grey (slightly lighter than site for print)
LINE = Color(1, 1, 1, alpha=0.14)   # hairline borders

# Fonts: Times echoes the Playfair Display headings; Helvetica the DM Sans body;
# Courier the Space Mono labels. All are built into reportlab (no embedding).
F_DISPLAY = "Times-Bold"
F_DISPLAY_ROMAN = "Times-Roman"
F_BODY = "Helvetica"
F_BODY_BOLD = "Helvetica-Bold"
F_LABEL = "Courier"

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / "assets" / "img" / "logo.png"
OUT = ROOT / "assets" / "docs" / "black-star-media-company-profile.pdf"

PAGE_W, PAGE_H = A4
MARGIN = 20 * mm

SITE = "blackstarmedia.com.au"
EMAIL = "contact@blackstarmedia.com.au"


# ---------------------------------------------------------------------------
# Paragraph styles
# ---------------------------------------------------------------------------
def styles():
    s = {}
    s["eyebrow"] = ParagraphStyle(
        "eyebrow", fontName=F_LABEL, fontSize=8.5, textColor=ACCENT,
        leading=12, spaceAfter=6, tracking=2,
    )
    s["h2"] = ParagraphStyle(
        "h2", fontName=F_DISPLAY, fontSize=21, textColor=WHITE,
        leading=25, spaceAfter=10,
    )
    s["body"] = ParagraphStyle(
        "body", fontName=F_BODY, fontSize=10.5, textColor=HexColor("#C9CCD1"),
        leading=16, spaceAfter=9,
    )
    s["card_label"] = ParagraphStyle(
        "card_label", fontName=F_LABEL, fontSize=7.5, textColor=MUTED, leading=11,
    )
    s["card_title"] = ParagraphStyle(
        "card_title", fontName=F_DISPLAY, fontSize=14, textColor=WHITE,
        leading=17, spaceBefore=3, spaceAfter=4,
    )
    s["card_title_accent"] = ParagraphStyle(
        "card_title_accent", parent=s["card_title"], textColor=ACCENT,
    )
    s["card_body"] = ParagraphStyle(
        "card_body", fontName=F_BODY, fontSize=9, textColor=HexColor("#AEB2B8"),
        leading=13.5,
    )
    s["stat_num"] = ParagraphStyle(
        "stat_num", fontName=F_DISPLAY, fontSize=30, textColor=ACCENT,
        leading=32, alignment=TA_CENTER,
    )
    s["stat_label"] = ParagraphStyle(
        "stat_label", fontName=F_LABEL, fontSize=7, textColor=MUTED,
        leading=10, alignment=TA_CENTER, spaceAfter=4,
    )
    s["stat_body"] = ParagraphStyle(
        "stat_body", fontName=F_BODY, fontSize=8, textColor=HexColor("#AEB2B8"),
        leading=11.5, alignment=TA_CENTER, spaceBefore=4,
    )
    s["tick"] = ParagraphStyle(
        "tick", fontName=F_BODY, fontSize=10, textColor=HexColor("#C9CCD1"),
        leading=15, leftIndent=14, spaceAfter=6,
        bulletIndent=0, bulletFontName=F_BODY_BOLD, bulletFontSize=10,
    )
    return s


# ---------------------------------------------------------------------------
# Page backgrounds / chrome
# ---------------------------------------------------------------------------
def _paint_bg(canvas):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.restoreState()


def cover_page(canvas, doc):
    _paint_bg(canvas)
    canvas.saveState()

    cx = PAGE_W / 2
    # Logo
    if LOGO.exists():
        from reportlab.lib.utils import ImageReader
        img = ImageReader(str(LOGO))
        iw, ih = img.getSize()
        target_w = 52 * mm
        target_h = target_w * ih / iw
        canvas.drawImage(
            img, cx - target_w / 2, PAGE_H - 78 * mm,
            width=target_w, height=target_h, mask="auto",
        )

    # Wordmark
    canvas.setFillColor(WHITE)
    canvas.setFont(F_BODY_BOLD, 15)
    wm_y = PAGE_H - 92 * mm
    word_black = "BLACK "
    word_star = "★STAR "
    word_media = "MEDIA"
    total = (canvas.stringWidth(word_black, F_BODY_BOLD, 15)
             + canvas.stringWidth(word_star, F_BODY_BOLD, 15)
             + canvas.stringWidth(word_media, F_BODY_BOLD, 15))
    x = cx - total / 2
    canvas.setFillColor(WHITE)
    canvas.drawString(x, wm_y, word_black)
    x += canvas.stringWidth(word_black, F_BODY_BOLD, 15)
    canvas.setFillColor(ACCENT)
    canvas.drawString(x, wm_y, word_star)
    x += canvas.stringWidth(word_star, F_BODY_BOLD, 15)
    canvas.setFillColor(MUTED)
    canvas.drawString(x, wm_y, word_media)

    # Eyebrow
    canvas.setFillColor(ACCENT)
    canvas.setFont(F_LABEL, 9)
    canvas.drawCentredString(cx, PAGE_H - 112 * mm, "C O M P A N Y   P R O F I L E")

    # Title (two lines, serif)
    canvas.setFillColor(WHITE)
    canvas.setFont(F_DISPLAY, 30)
    canvas.drawCentredString(cx, PAGE_H - 130 * mm, "An independent studio for")
    canvas.drawCentredString(cx, PAGE_H - 143 * mm, "music, AI and culture.")

    # Tagline
    canvas.setFillColor(HexColor("#AEB2B8"))
    canvas.setFont(F_BODY, 11)
    canvas.drawCentredString(
        cx, PAGE_H - 158 * mm,
        "Brisbane-based multimedia entertainment across music, AI education")
    canvas.drawCentredString(
        cx, PAGE_H - 165 * mm,
        "and original digital content.")

    # Accent rule
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.5)
    canvas.line(cx - 18 * mm, PAGE_H - 176 * mm, cx + 18 * mm, PAGE_H - 176 * mm)

    # Footer meta
    canvas.setFillColor(MUTED)
    canvas.setFont(F_LABEL, 8.5)
    canvas.drawCentredString(cx, 22 * mm, f"{SITE}   ·   {EMAIL}")
    canvas.setFillColor(HexColor("#5A5F66"))
    canvas.drawCentredString(cx, 16 * mm, "Est. Brisbane · AU  —  Operating worldwide")

    canvas.restoreState()


def content_page(canvas, doc):
    _paint_bg(canvas)
    canvas.saveState()
    # Running header
    canvas.setFillColor(MUTED)
    canvas.setFont(F_LABEL, 7.5)
    canvas.drawString(MARGIN, PAGE_H - 13 * mm, "BLACK ★ STAR MEDIA")
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 13 * mm, "COMPANY PROFILE")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN, PAGE_H - 16 * mm, PAGE_W - MARGIN, PAGE_H - 16 * mm)
    # Footer page number
    canvas.setFillColor(HexColor("#5A5F66"))
    canvas.setFont(F_LABEL, 7.5)
    canvas.drawString(MARGIN, 12 * mm, SITE)
    canvas.drawRightString(PAGE_W - MARGIN, 12 * mm, f"{doc.page:02d}")
    canvas.restoreState()


# ---------------------------------------------------------------------------
# Reusable flowable builders
# ---------------------------------------------------------------------------
def card(label, title, body, st, accent_title=False):
    """A single bordered card cell as a nested Table (for the dark surface look)."""
    inner = []
    if label:
        inner.append(Paragraph(label, st["card_label"]))
    inner.append(Paragraph(title, st["card_title_accent"] if accent_title else st["card_title"]))
    if body:
        inner.append(Paragraph(body, st["card_body"]))
    t = Table([[i] for i in inner], colWidths=[None])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 11),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def grid(cards, cols, gutter=6 * mm):
    """Lay cards out in a `cols`-wide grid with equal column widths."""
    avail = PAGE_W - 2 * MARGIN
    col_w = (avail - (cols - 1) * gutter) / cols
    rows = []
    spacer_w = gutter
    for i in range(0, len(cards), cols):
        row = cards[i:i + cols]
        row += [""] * (cols - len(row))
        # interleave spacer columns
        cells = []
        for j, c in enumerate(row):
            cells.append(c)
            if j < cols - 1:
                cells.append("")
        rows.append(cells)
    widths = []
    for j in range(cols):
        widths.append(col_w)
        if j < cols - 1:
            widths.append(spacer_w)
    t = Table(rows, colWidths=widths, hAlign="LEFT")
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), gutter),
    ]
    t.setStyle(TableStyle(style))
    return t


def stat(num, label, body, st):
    inner = [
        Paragraph(label, st["stat_label"]),
        Paragraph(num, st["stat_num"]),
        Paragraph(body, st["stat_body"]),
    ]
    t = Table([[i] for i in inner])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


# ---------------------------------------------------------------------------
# Build the document
# ---------------------------------------------------------------------------
def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    st = styles()

    doc = BaseDocTemplate(
        str(OUT), pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=22 * mm, bottomMargin=20 * mm,
        title="Black Star Media & Entertainment — Company Profile",
        author="Black Star Media & Entertainment",
        subject="Company Profile",
        creator="blackstarmedia.com.au",
    )

    frame = Frame(
        MARGIN, 18 * mm,
        PAGE_W - 2 * MARGIN, PAGE_H - 22 * mm - 18 * mm,
        id="content", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
    )
    doc.addPageTemplates([
        PageTemplate(id="cover", frames=[frame], onPage=cover_page),
        PageTemplate(id="content", frames=[frame], onPage=content_page),
    ])

    story = []

    # ---- Cover (content drawn by onPage; just advance) ----
    story.append(NextPageTemplate("content"))
    story.append(PageBreak())

    # ---- Page: Who We Are + At a Glance ----
    story.append(Paragraph("WHO WE ARE", st["eyebrow"]))
    story.append(Paragraph("One studio. A portfolio of ventures.", st["h2"]))
    story.append(Paragraph(
        "Black Star Media &amp; Entertainment is an independent media management "
        "company headquartered in Brisbane, Queensland. We create, produce and "
        "operate a growing family of brands &mdash; from AI-composed music and "
        "original YouTube channels to hands-on AI education.", st["body"]))
    story.append(Paragraph(
        "Everything we make is united by one idea: that technology, when paired "
        "with genuine craft, can bring people together and tell better stories. "
        "We treat AI as a creative engine, not a gimmick &mdash; a way to make "
        "music, media and education that wasn't possible yesterday.", st["body"]))

    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("AT A GLANCE", st["eyebrow"]))
    story.append(Paragraph("The studio in numbers.", st["h2"]))
    story.append(Spacer(1, 3 * mm))
    stats = [
        stat("04", "PORTFOLIO", "Active ventures across music, content &amp; AI education.", st),
        stat("02", "CONTENT", "Original YouTube channels, plus a Spotify artist.", st),
        stat("04", "EDUCATION", "Module AI:M Workshops curriculum, beginner to creator.", st),
        stat("BNE", "BASE", "Headquartered in Brisbane &mdash; operating worldwide.", st),
    ]
    story.append(grid(stats, 4, gutter=5 * mm))

    story.append(PageBreak())

    # ---- Page: Portfolio ----
    story.append(Paragraph("OUR VENTURES", st["eyebrow"]))
    story.append(Paragraph("The Black Star portfolio.", st["h2"]))
    story.append(Paragraph(
        "A growing collection of brands, each with its own audience, united by "
        "culture, community and technology.", st["body"]))
    story.append(Spacer(1, 4 * mm))
    ventures = [
        card("MUSIC", "Tha Mega Boy Band",
             "One of the first entirely AI-created pop groups &mdash; voices, "
             "harmonies and lyrics generated, human emotion by design. Now "
             "streaming on Spotify.", st),
        card("CONTENT", "AI MEGA VAULT",
             "A YouTube channel of hands-on tutorials and breakdowns on the AI "
             "tools reshaping how content gets made.", st),
        card("CONTENT", "NeoSoul Music",
             "AI-composed neo-soul and jazz lounge sessions &mdash; warm, "
             "late-night listening for focus and calm, published weekly.", st),
        card("EDUCATION", "AI:M Workshops",
             "Artificial Intelligence: Mastery &mdash; a beginner-friendly, "
             "four-module program from AI foundations to creating your own "
             "AI-powered content.", st),
    ]
    story.append(grid(ventures, 2, gutter=6 * mm))

    story.append(PageBreak())

    # ---- Page: What We Do + CTA ----
    story.append(Paragraph("WHAT WE DO", st["eyebrow"]))
    story.append(Paragraph("From the studio to the screen.", st["h2"]))
    story.append(Paragraph(
        "We build brands end to end &mdash; the creative, the technology and the "
        "community around them.", st["body"]))
    story.append(Spacer(1, 2 * mm))
    for item in [
        "Original music production, including AI-composed releases",
        "YouTube channel development and weekly content",
        "AI education &mdash; in-person in Brisbane and online",
        "Digital media, branding and creative direction",
    ]:
        story.append(Paragraph(item, st["tick"], bulletText="—"))

    story.append(Spacer(1, 6 * mm))
    pillars = [
        card(None, "Culture", "Stories, sounds and ideas &mdash; crafted for audiences everywhere.", st, accent_title=True),
        card(None, "Innovation", "We use AI as a creative engine, making work that wasn't possible yesterday.", st, accent_title=True),
        card(None, "Community", "From the studio to the classroom, every venture brings people together.", st, accent_title=True),
        card(None, "Craft", "Premium, considered and cinematic &mdash; quality in every detail.", st, accent_title=True),
    ]
    story.append(grid(pillars, 2, gutter=6 * mm))

    story.append(Spacer(1, 6 * mm))
    # Contact CTA band
    cta_inner = [
        Paragraph("GET IN TOUCH", st["eyebrow"]),
        Paragraph("Let's build something.", st["h2"]),
        Paragraph(
            "Music, workshops, media or partnerships &mdash; tell us what you "
            "have in mind. We typically respond within 1&ndash;2 business days.",
            st["body"]),
        Paragraph(f"<b>{EMAIL}</b>  &nbsp;·&nbsp;  {SITE}",
                  ParagraphStyle("cta", fontName=F_BODY, fontSize=11,
                                 textColor=ACCENT, leading=16)),
    ]
    cta = Table([[i] for i in cta_inner], colWidths=[PAGE_W - 2 * MARGIN])
    cta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SURFACE),
        ("BOX", (0, 0), (-1, -1), 0.8, ACCENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
    ]))
    story.append(cta)

    doc.build(story)
    print(f"Wrote {OUT}  ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    build()
