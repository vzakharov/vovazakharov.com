"""A grammar-made stand-in for the synthetic bureaucratic corpus.

A real corpus would be written by a large LLM (varied, idiomatic); this one only has to
show whether an 8M model picks up the *format* on CPU in minutes.
tmp/llm/venv/bin/python -I tmp/llm/corpus_gen.py <n_docs> > corpus.txt
"""

import random
import sys

R = random.Random(42)
SUR = "Hartley Okonkwo Varga Lindqvist Moreau Petrov Tanaka Alvarez Brandt Kowalski Ferreira Novak Ashdown Quill Thorne Mbeki Castellan Ruiz Hollis Graves Pemberton Dunmore Sato Ilyin Weatherby Crane Fitzroy Abernathy".split()
GIV = "Edwin Margaret Tobias Alma Hector Ines Wilhelmina Arthur Josephine Ignatius Clara Bartholomew Ada Cornelius Agnes Ezra Matilda Rupert Odile Silas Prudence".split()
PLACES = "Leeds, Carthage, Lower Wickham, Thebes, Antwerp, the Third District, Novgorod, Port Elspeth, Floor 26, Ur, Kingston-upon-Hull, the Eastern Annex, Smyrna, Bruges, Room 12".split(", ")
OFFICES = "the Bureau of Weights, the Department of Lesser Records, the Office of the Comptroller, the Archive Committee, the Customs House, the Treasury of the Lower Granary, the Registry of Deeds".split(", ")
ITEMS = "filing cabinet (oak) | typewriter, model 4 | ledger, bound in calfskin | abacus, missing three beads | lamp, kerosene | chair, swivel, one leg short | rubber stamp \"APPROVED\" | clay tablets, set of twelve | quill pens, box of 100 | binder, grey, spine torn | inkwell, cracked | stool, three-legged | barrel of salted herring".split(" | ")
REASONS = "wear and tear | damage by damp | loss during relocation | theft by persons unknown | obsolescence | gnawed by rodents | flooding of the lower floors | fire in the east wing | deemed heretical by the committee".split(" | ")
MONTHS = "January February March April May June July August September October November December".split()
VERBS = "notes | records | confirms | regrets to report | draws attention to the fact | reminds all staff | has been informed".split(" | ")
FACTS = [
    "that the binders of Room {r} were not returned by the end of the quarter",
    "that the stamp of the department was applied upside down on {n} documents",
    "that the lift between floors {r} and {r2} remains out of order",
    "that the inventory of shelf {r} does not match the ledger",
    "that the tea allowance for the month of {m} has been exhausted",
    "that requests submitted in triplicate must also be submitted in quadruplicate",
    "that the archivist {g} {s} has not been seen since {d}",
]


def name():
    return f"{R.choice(GIV)} {R.choice(SUR)}"


def date():
    y = R.choice([R.randint(-3000, 0), R.randint(1, 1500), R.randint(1500, 2000), R.randint(2000, 2400)])
    y = y or 1
    return f"{R.randint(1, 28)} {R.choice(MONTHS)} {f'{1 - y} BC' if y <= 0 else (f'AD {y}' if y < 1000 else y)}"


def fact():
    return R.choice(FACTS).format(r=R.randint(1, 60), r2=R.randint(1, 60), n=R.randint(2, 900), m=R.choice(MONTHS), g=R.choice(GIV), s=R.choice(SUR), d=date())


def head(title):
    return f"Floor {R.randint(1, 60)}, room {R.randint(1, 30)}, shelf {R.randint(1, 6)}, folder {R.randint(1, 99)}, page {R.randint(1, 9)}\n\n{title}\nNo. {R.randint(1, 999)}\nDate: {date()}\n\n"


def personnel():
    s = head("PERSONNEL FILE") + f"Surname: {R.choice(SUR)}\nFirst name: {R.choice(GIV)}\nDate of birth: {date()}\nPlace of birth: {R.choice(PLACES)}\n"
    s += f"Position: {R.choice(['junior clerk', 'senior clerk', 'archivist, second class', 'keeper of seals', 'scribe', 'inspector of shelves'])}, {R.choice(OFFICES)}\n"
    s += f"Marital status: {R.choice(['single', 'married', 'widowed', 'not stated'])}\nDate of death: {R.choice([date(), 'not recorded', 'see folder ' + str(R.randint(1, 99))])}\n"
    s += f"Remarks: {R.choice(['Diligent. Punctual. Prone to sighing.', 'Reprimanded twice for unauthorised use of the stamp.', 'Transferred at own request.', 'No remarks.', 'File incomplete; pages ' + str(R.randint(2, 9)) + ' to ' + str(R.randint(10, 20)) + ' missing.'])}\n"
    return s


def memo():
    s = head("MEMORANDUM") + f"To: {name()}, {R.choice(OFFICES)}\nFrom: {name()}\nSubject: {R.choice(['Missing binders', 'Stationery', 'Lift', 'Staff conduct', 'Quarterly returns'])}\n\n"
    for _ in range(R.randint(2, 4)):
        s += f"The office {R.choice(VERBS)} {fact()}. "
    return s + f"\n\nSigned: {name()}\n"


def writeoff():
    s = head("ACT OF WRITE-OFF of inventory items unfit for further use") + "The commission, consisting of:\n"
    for i in range(R.randint(2, 4)):
        s += f"{i + 1}. {name()}, {R.choice(['chairman', 'member', 'secretary', 'witness'])}\n"
    s += "has examined the following items and found them unfit for further use:\n\n"
    for i in range(R.randint(2, 5)):
        s += f"{i + 1}. {R.choice(ITEMS)} — {R.randint(1, 40)} pcs. Reason: {R.choice(REASONS)}.\n"
    return s + f"\nThe items are to be {R.choice(['burned', 'returned to the warehouse', 'buried', 'sold at auction', 'kept in the archive'])}.\n"


def tax():
    s = head("TAX WRITE-OFF REPORT") + f"Taxpayer: {name()}, {R.choice(PLACES)}\nAssessed by: {R.choice(OFFICES)}\n\n"
    s += f"Amount written off: {R.randint(1, 9000)} {R.choice(['shekels', 'ducats', 'pounds sterling', 'talents', 'credits', 'measures of barley'])}\n"
    return s + f"Grounds: {R.choice(REASONS)}; {fact()}.\nApproved: {name()}, {R.choice(['comptroller', 'scribe of the treasury', 'deputy assessor'])}\n"


def minutes():
    s = head("MINUTES OF THE MEETING of the Committee on Archival Storage") + "Present: " + ", ".join(name() for _ in range(R.randint(2, 5))) + "\n\n"
    for i in range(R.randint(2, 4)):
        s += f"{i + 1}. HEARD: {name()} on the matter {fact()}.\n   RESOLVED: {R.choice(['to note', 'to postpone', 'to form a subcommittee', 'to write off', 'to file in folder ' + str(R.randint(1, 99))])}.\n"
    return s


def claim():
    s = head("COPYRIGHT INFRINGEMENT CLAIM") + f"Claimant: {name()}, author of \"{R.choice(['A Treatise on Shelving', 'The Lament of the Scribe', 'Hymn to the Granary', 'Collected Receipts', 'On Ink'])}\"\nRespondent: {name()}\n\n"
    return s + f"The claimant states that the respondent copied {R.randint(2, 400)} lines without permission, {R.choice(['onto clay', 'onto papyrus', 'by photocopier', 'by hand', 'into a ledger'])}, and requests {R.choice(['compensation', 'the destruction of the copies', 'a public apology', 'a hearing before the committee'])}.\n"


DOCS = [personnel, memo, writeoff, tax, minutes, claim]
n = int(sys.argv[1])
print("\n<|endoftext|>\n".join(R.choice(DOCS)() for _ in range(n)))
