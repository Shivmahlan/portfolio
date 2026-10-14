#!/usr/bin/env python3
"""Minimal Markdown -> PDF converter for the portfolio documentation.

Reads DOCUMENTATION.md and emits DOCUMENTATION.pdf using reportlab.
Handles: headings, simple tables, fenced code blocks, bullet/numbered
lists, bold (**...**) and inline code (`...`).
"""
import re
import sys
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Preformatted, ListFlowable, ListItem,
)

SRC = "DOCUMENTATION.md"
OUT = "DOCUMENTATION.pdf"

INK = colors.HexColor("#1d1d1b")
EMBER = colors.HexColor("#9f2f0f")
PARCHMENT = colors.HexColor("#e2dedb")
BONE = colors.HexColor("#cdc6be")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], textColor=EMBER,
                    fontName="Helvetica-Bold", fontSize=20, spaceBefore=14, spaceAfter=8)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], textColor=INK,
                    fontName="Helvetica-Bold", fontSize=14, spaceBefore=12, spaceAfter=5)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], textColor=INK,
                    fontName="Helvetica-Bold", fontSize=11.5, spaceBefore=9, spaceAfter=3)
BODY = ParagraphStyle("BODY", parent=styles["BodyText"], textColor=INK,
                      fontName="Helvetica", fontSize=9.5, leading=13.5,
                      alignment=TA_LEFT, spaceAfter=5)
CODE = ParagraphStyle("CODE", parent=styles["Code"], textColor=INK,
                      fontName="Courier", fontSize=8, leading=10.5,
                      backColor=PARCHMENT, borderPadding=6, spaceAfter=6, spaceBefore=2)
META = ParagraphStyle("META", parent=BODY, textColor=INK, fontSize=9.5)


def rich(text):
    """Escape XML, then apply bold + inline-code markup."""
    t = escape(text)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"`(.+?)`", r'<font name="Courier">\1</font>', t)
    return t


def parse_table(rows):
    data = []
    header = [rich(c.strip()) for c in rows[0].strip("|").split("|")]
    data.append(header)
    for r in rows[2:]:  # skip separator row (index 1)
        data.append([rich(c.strip()) for c in r.strip("|").split("|")])
    tbl = Table(data, hAlign="LEFT", colWidths=[None] * len(header))
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), EMBER),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BONE]),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#514c47")),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return tbl


def build():
    with open(SRC, encoding="utf-8") as f:
        lines = f.read().splitlines()

    story = []
    i = 0
    n = len(lines)
    in_code = False
    code_buf = []

    while i < n:
        line = lines[i]

        if line.strip().startswith("```"):
            if in_code:
                story.append(Preformatted("\n".join(code_buf), CODE))
                code_buf = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_buf.append(line)
            i += 1
            continue

        # Table block
        if line.lstrip().startswith("|") and i + 1 < n and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            rows = []
            while i < n and lines[i].lstrip().startswith("|"):
                rows.append(lines[i])
                i += 1
            story.append(parse_table(rows))
            story.append(Spacer(1, 4))
            continue

        # Headings
        m = re.match(r"^(#{1,3})\s+(.*)$", line)
        if m:
            lvl, txt = len(m.group(1)), m.group(2)
            style = {1: H1, 2: H2, 3: H3}[lvl]
            story.append(Paragraph(rich(txt), style))
            i += 1
            continue

        # Bullet list
        if re.match(r"^\s*[-*]\s+", line):
            items = []
            while i < n and re.match(r"^\s*[-*]\s+", lines[i]):
                txt = re.sub(r"^\s*[-*]\s+", "", lines[i])
                items.append(ListItem(Paragraph(rich(txt), BODY), leftIndent=10))
                i += 1
            story.append(ListFlowable(items, bulletType="bullet", start="•",
                                       leftIndent=12, bulletColor=EMBER))
            story.append(Spacer(1, 3))
            continue

        # Numbered list
        if re.match(r"^\s*\d+\.\s+", line):
            items = []
            while i < n and re.match(r"^\s*\d+\.\s+", lines[i]):
                txt = re.sub(r"^\s*\d+\.\s+", "", lines[i])
                items.append(ListItem(Paragraph(rich(txt), BODY)))
                i += 1
            story.append(ListFlowable(items, bulletType="1", leftIndent=14))
            story.append(Spacer(1, 3))
            continue

        # Blank line
        if not line.strip():
            story.append(Spacer(1, 4))
            i += 1
            continue

        # Plain paragraph
        story.append(Paragraph(rich(line), BODY))
        i += 1

    if in_code and code_buf:
        story.append(Preformatted("\n".join(code_buf), CODE))

    doc = SimpleDocTemplate(
        OUT, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=16 * mm, bottomMargin=16 * mm,
        title="Shiv's Data Ledger — Portfolio Documentation",
        author="Shiv Kumar",
    )
    doc.build(story)
    print(f"WROTE {OUT}")


if __name__ == "__main__":
    build()
