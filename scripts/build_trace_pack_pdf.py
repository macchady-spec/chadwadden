from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "resources" / "trace-teacher-pack" / "trace-teacher-pack.pdf"

NAVY = colors.HexColor("#10243B")
TEAL = colors.HexColor("#0EA5A0")
TEAL_DARK = colors.HexColor("#087F7B")
TEAL_PALE = colors.HexColor("#EAF7F6")
INK = colors.HexColor("#10243B")
MUTED = colors.HexColor("#50677A")
LINE = colors.HexColor("#D6E4E8")
PAPER = colors.HexColor("#F7FAFA")
ORANGE = colors.HexColor("#E07B39")


def register_fonts():
    candidates = [
        ("SourceSans", "/System/Library/Fonts/Supplemental/Arial.ttf"),
        ("SourceSansBold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
        ("SourceSerif", "/System/Library/Fonts/Supplemental/Georgia.ttf"),
        ("SourceSerifBold", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"),
    ]
    for name, path in candidates:
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont(name, path))


register_fonts()
BODY_FONT = "SourceSans" if "SourceSans" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
BOLD_FONT = "SourceSansBold" if "SourceSansBold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
TITLE_FONT = "SourceSerifBold" if "SourceSerifBold" in pdfmetrics.getRegisteredFontNames() else "Times-Bold"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", fontName=BOLD_FONT, fontSize=8, leading=10, textColor=TEAL_DARK, spaceAfter=8, tracking=1.3))
styles.add(ParagraphStyle(name="TitleLarge", fontName=TITLE_FONT, fontSize=31, leading=34, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="PageTitle", fontName=TITLE_FONT, fontSize=22, leading=25, textColor=INK, spaceAfter=10))
styles.add(ParagraphStyle(name="Deck", fontName=BODY_FONT, fontSize=11.5, leading=16, textColor=MUTED, spaceAfter=12))
styles.add(ParagraphStyle(name="BodyPack", fontName=BODY_FONT, fontSize=9.4, leading=13, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="BodySmall", fontName=BODY_FONT, fontSize=7.7, leading=10.2, textColor=MUTED, spaceAfter=4))
styles.add(ParagraphStyle(name="CardTitle", fontName=BOLD_FONT, fontSize=9.2, leading=11, textColor=TEAL_DARK, spaceAfter=4))
styles.add(ParagraphStyle(name="WhiteTitle", fontName=BOLD_FONT, fontSize=10, leading=13, textColor=colors.white, spaceAfter=5))
styles.add(ParagraphStyle(name="WhiteBody", fontName=BODY_FONT, fontSize=8.7, leading=12, textColor=colors.white))
styles.add(ParagraphStyle(name="Footer", fontName=BODY_FONT, fontSize=7.4, leading=9, textColor=MUTED, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Centered", parent=styles["BodyPack"], alignment=TA_CENTER))


def page_frame(canvas, doc):
    width, height = letter
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 0.34 * inch, width, 0.34 * inch, stroke=0, fill=1)
    canvas.setFillColor(TEAL)
    canvas.rect(0, height - 0.38 * inch, width, 0.04 * inch, stroke=0, fill=1)
    canvas.setFont(BOLD_FONT, 7.5)
    canvas.setFillColor(colors.white)
    canvas.drawString(0.62 * inch, height - 0.22 * inch, "THE TRACE TEACHER PACK")
    canvas.setFont(BODY_FONT, 7.5)
    canvas.drawRightString(width - 0.62 * inch, height - 0.22 * inch, f"CHAD WADDEN  |  {doc.page}")
    canvas.setStrokeColor(LINE)
    canvas.line(0.62 * inch, 0.43 * inch, width - 0.62 * inch, 0.43 * inch)
    canvas.setFont(BODY_FONT, 6.8)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(width / 2, 0.25 * inch, "Practical working framework. Not a validated intervention or institutional endorsement.")
    canvas.restoreState()


def p(text, style="BodyPack"):
    return Paragraph(text, styles[style])


def box(content, background=PAPER, border=LINE, padding=10):
    table = Table([[content]], colWidths=[7.02 * inch])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), background),
        ("BOX", (0, 0), (-1, -1), 0.8, border),
        ("LEFTPADDING", (0, 0), (-1, -1), padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), padding),
        ("TOPPADDING", (0, 0), (-1, -1), padding),
        ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
    ]))
    return table


def labelled_lines(label, prompt, rows=3):
    elements = [p(label.upper(), "CardTitle"), p(prompt, "BodySmall")]
    for _ in range(rows):
        elements += [Spacer(1, 7), Table([[""]], colWidths=[3.14 * inch], rowHeights=[1], style=TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.6, LINE)]))]
    return elements


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.62 * inch,
        rightMargin=0.62 * inch,
        topMargin=0.62 * inch,
        bottomMargin=0.62 * inch,
        title="The TRACE Teacher Pack",
        author="Chad Wadden",
        subject="Planning AI-supported learning without handing over the thinking",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="pack", frames=[frame], onPage=page_frame)])

    story = []

    # PAGE 1 - Framework and two operating modes
    story += [Spacer(1, 8), p("TEACHER RESOURCE  |  VERSION 1.0", "Kicker"), p("The TRACE Teacher Pack", "TitleLarge")]
    story += [p("<b>Plan AI-supported learning without handing over the thinking.</b> A compact planning and reflection kit for classroom teachers.", "Deck")]
    trace_data = []
    for initial, label in [("T", "Target the thinking"), ("R", "Retrieve before AI"), ("A", "Ask with boundaries"), ("C", "Check the output"), ("E", "Edit and explain")]:
        trace_data.append([p(f"<font size='18'><b>{initial}</b></font><br/>{label}", "Centered")])
    trace = Table([sum(trace_data, [])], colWidths=[1.36 * inch] * 5, rowHeights=[0.92 * inch])
    trace.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL_PALE), ("BOX", (0, 0), (-1, -1), 0.7, TEAL),
        ("INNERGRID", (0, 0), (-1, -1), 4, colors.white), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [trace, Spacer(1, 14)]
    story += [box(p("<b>Honest label:</b> TRACE is Chad's interpretation and working framework, not a validated intervention. AI can question, prompt, and reflect. The learner still has to supply the thinking worth reflecting on."), TEAL_PALE, TEAL)]
    story += [Spacer(1, 17), p("Two connected ways to use TRACE", "PageTitle")]
    modes = Table([
        [p("FOR STUDENT LEARNING", "CardTitle"), p("FOR A BOUNDED AI JOB", "CardTitle")],
        [p("<b>Try first</b><br/>Reveal reasoning<br/>Annotate<br/>Check<br/>Evolve", "BodyPack"), p("<b>Task</b><br/>Relevant context<br/>Actions and aids<br/>Checks<br/>Exit and escalation", "BodyPack")],
        [p("The learner attempts, explains, inspects, and revises.", "BodySmall"), p("The teacher defines the work, evidence, limits, validation, and handoff.", "BodySmall")],
    ], colWidths=[3.42 * inch, 3.42 * inch])
    modes.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER), ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 4, colors.white), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 13), ("RIGHTPADDING", (0, 0), (-1, -1), 13),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story += [modes, Spacer(1, 14), p("<b>The line in the sand:</b> strong performance while assistance is available is not the same as learning that remains when assistance is removed. The wrapper around AI matters because it changes what the student still has to do.", "BodyPack")]
    story += [Spacer(1, 10), box(p("<b>START HERE</b><br/>1. Read the completed example on page 2. &nbsp;&nbsp; 2. Plan one bounded job on page 3. &nbsp;&nbsp; 3. Give students the revision handout on page 4.", "BodyPack"), TEAL_PALE, TEAL)]
    story += [PageBreak()]

    # PAGE 2 - Worked example
    story += [p("WORKED CLASSROOM EXAMPLE", "Kicker"), p("From a vague AI activity to a bounded learning task", "PageTitle")]
    story += [p("<b>Teacher-created practice question:</b> Evaluate whether schools should use generative AI to support student feedback.", "Deck")]
    rows = [
        ("T - Target", "Make a defensible judgment using a claim, relevant evidence, a counterclaim, and a reasoned conclusion."),
        ("R - Retrieve", "Write for five minutes from memory before any AI support. Mark the sentence where the judgment becomes visible."),
        ("A - Ask", "AI may ask diagnostic questions only. It may not rewrite, score, add facts, or provide a model answer."),
        ("C - Check", "Compare the response with teacher criteria and approved class sources. AI comments remain suggestions, not authority."),
        ("E - Edit", "Revise one paragraph, then write: 'I changed... because... I still need to check...'"),
    ]
    example_table = Table([[p(title, "CardTitle"), p(text)] for title, text in rows], colWidths=[1.18 * inch, 5.66 * inch])
    example_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), TEAL_PALE), ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story += [example_table, Spacer(1, 14)]
    prompt = p("<b>Bounded prompt</b><br/>You are a questioning coach. Read this anonymous practice paragraph. Ask no more than three questions about the claim-evidence connection, counterclaim, and final judgment. Do not rewrite the paragraph, add facts, score it, or provide a model answer. Stop after the questions.", "WhiteBody")
    story += [box(prompt, NAVY, NAVY, 14), Spacer(1, 14)]
    story += [p("What a useful result looks like", "CardTitle")]
    result_table = Table([
        [p("AI MAY RETURN", "CardTitle"), p("THE STUDENT MUST STILL DO", "CardTitle")],
        [p("Three diagnostic questions about missing reasoning or weak connections."), p("Choose which question matters, check sources and criteria, revise the paragraph, and explain the change.")],
    ], colWidths=[3.42 * inch, 3.42 * inch])
    result_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PAPER), ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story += [result_table, Spacer(1, 13), box(p("<b>Safety preflight:</b> use an anonymous practice response; never paste student names or private records; never treat AI scoring as authoritative; a teacher remains responsible for the task, evidence, and final judgment."), colors.HexColor("#FFF5EC"), ORANGE)]
    story += [PageBreak()]

    # PAGE 3 - Teacher planner
    story += [p("TEACHER PLANNING SHEET", "Kicker"), p("Build one bounded AI job", "PageTitle")]
    story += [p("Start with the learning, not the model. Complete this sheet before a student or agent receives the prompt.", "Deck")]
    planners = [
        ("1. Learning target", "What thinking must remain with the learner?"),
        ("2. Starting evidence", "What must happen before AI enters the task?"),
        ("3. Allowed AI role", "Questioner, critic, formatter, tutor - or no AI at all?"),
        ("4. Forbidden actions", "What must it never write, decide, score, publish, or change?"),
        ("5. Permitted context", "What approved, privacy-safe material may it read?"),
        ("6. Exact deliverable", "Name the format, maximum length, and destination."),
        ("7. Deterministic checks", "Which source, criteria, test, or human judgment verifies it?"),
        ("8. Exit and escalation", "When must the agent stop and return control to a human?"),
    ]
    cells = [labelled_lines(title, prompt, 4) for title, prompt in planners]
    planner_table = Table(
        [[cells[i], cells[i + 1]] for i in range(0, len(cells), 2)],
        colWidths=[3.42 * inch, 3.42 * inch],
        rowHeights=[1.2 * inch] * 4,
    )
    planner_table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story += [planner_table, Spacer(1, 10)]
    story += [p("FINAL CHECK  [ ] No identifiable student information  [ ] Genuine attempt before assistance  [ ] No autonomous grading or publishing  [ ] Human review is named", "BodySmall")]
    story += [PageBreak()]

    # PAGE 4 - Student handout, quick activity, sources
    story += [p("STUDENT HANDOUT", "Kicker"), p("TRACE your revision", "PageTitle")]
    story += [p("Name: ______________________________    Task: ______________________________", "BodyPack")]
    quick_example = [
        p("QUICK EXAMPLE - WHAT AM I SUPPOSED TO DO?", "CardTitle"),
        p("<b>My first attempt:</b> 'AI feedback is always fair because computers are not biased.'", "BodySmall"),
        p("<b>My bounded prompt:</b> Ask me up to three questions about my evidence, counterclaim, and judgment. Do not rewrite my answer.", "BodySmall"),
        p("<b>My reflection:</b> 'I changed always fair because I had not supported it and AI systems can reflect bias. I still need to check an approved source.'", "BodySmall"),
    ]
    story += [box(quick_example, PAPER, LINE, 10), Spacer(1, 9)]
    checks = [
        "I attempted the task before asking AI.",
        "I can explain the idea without reading the AI response.",
        "I checked the response against class criteria or an approved source.",
        "I identified one useful suggestion and one possible weakness.",
        "I revised in my own words and can explain what I changed.",
        "I did not share names, private records, or sensitive information.",
    ]
    story += [box([p(f"[ ] {item}") for item in checks], TEAL_PALE, TEAL), Spacer(1, 10)]
    reflection_cells = [
        labelled_lines("Most useful question", "The most useful question or suggestion was...", 2),
        labelled_lines("Judgment", "I did not accept this part because...", 2),
        labelled_lines("Revision", "I changed... because...", 2),
        labelled_lines("Uncertainty", "I still need to check or ask...", 2),
    ]
    reflect = Table([[reflection_cells[0], reflection_cells[1]], [reflection_cells[2], reflection_cells[3]]], colWidths=[3.42 * inch, 3.42 * inch])
    reflect.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9), ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [reflect, Spacer(1, 10)]
    story += [p("WHY THIS IS DESIGNED THIS WAY", "CardTitle")]
    story += [p("Retrieval, informative feedback, prompted self-explanation, and structured self-assessment support the rationale for an attempt-inspect-revise loop. They do not prove that TRACE or Chad's applications improve IB results.", "BodySmall")]
    sources = (
        "Roediger &amp; Karpicke (2006), doi.org/10.1111/j.1467-9280.2006.01693.x  |  "
        "Agarwal, Nunes &amp; Blunt (2021), doi.org/10.1007/s10648-021-09595-9  |  "
        "Wisniewski, Zierer &amp; Hattie (2020), doi.org/10.3389/fpsyg.2019.03087  |  "
        "Bisra et al. (2018), doi.org/10.1007/s10648-018-9434-x  |  "
        "Bastani et al. (2025), doi.org/10.1073/pnas.2422633122"
    )
    story += [p(sources, "BodySmall"), Spacer(1, 7)]
    story += [p("TRY THE TOOLS", "CardTitle"), p("Exam Practice Studio: macchady-spec.github.io/ib_paperPractice/ibdsdiag.html<br/>Response Studio: macchady-spec.github.io/ib_paperPractice/", "BodySmall")]
    story += [Spacer(1, 7), box(p("<b>Help me make this better.</b> Try TRACE once, then send one useful observation to chad.aigroove@gmail.com. Tell me where it helped - or where it fell apart. Real classroom feedback is more useful than applause."), TEAL_PALE, TEAL)]

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    build()
