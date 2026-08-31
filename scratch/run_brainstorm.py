import subprocess
import os

WORKSPACE = r"c:\Projects\SpendWise\_bmad-output\brainstorming\brainstorm-differentiating-feature-2026-08-31"
PROJECT_ROOT = r"c:\Projects\SpendWise"

def append_memlog(entry_type, text, by="coach"):
    cmd = [
        "uv", "run",
        os.path.join(PROJECT_ROOT, "_bmad", "scripts", "memlog.py"),
        "append",
        "--workspace", WORKSPACE,
        "--type", entry_type,
        "--text", text,
    ]
    if by:
        cmd.extend(["--by", by])
    
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    subprocess.run(cmd, check=True, env=env)

def switch_technique(name):
    cmd = [
        "uv", "run",
        os.path.join(PROJECT_ROOT, "_bmad", "scripts", "memlog.py"),
        "append",
        "--workspace", WORKSPACE,
        "--type", "technique",
        "--text", f"started {name}"
    ]
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    subprocess.run(cmd, check=True, env=env)

def set_status(val):
    cmd = [
        "uv", "run",
        os.path.join(PROJECT_ROOT, "_bmad", "scripts", "memlog.py"),
        "set",
        "--workspace", WORKSPACE,
        "--key", "status",
        "--value", val
    ]
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    subprocess.run(cmd, check=True, env=env)

# Technique 1: Yes And Building
switch_technique("Yes And Building")

chain_1 = [
    "Yes, and what if whenever you take a picture of a receipt or scan a barcode, the app doesn't show the price in Euros, but calculates the exact hours/minutes of your life you worked to earn that item based on your net hourly rate? (Life Energy Cost)",
    "Yes, and what if it lets you see an interactive timeline comparing that item decaying or depreciating over 6 months vs what that same money would grow into in an index fund after 10 years? (Opportunity Cost Simulator)",
    "Yes, and what if before you buy, it asks you: 'If someone offered you this item in one hand and the exact cash equivalent in the other, which would you walk away with?' (Cash Alternative Test)",
    "Yes, and what if when you still feel like buying, it forces a 'Cooling Off Smart Vault' where money is reserved for 24 hours, and if you do not reconfirm, it automatically funnels into your favorite savings goal?",
    "Yes, and what if it calculates your personal 'Regret Quotient' by asking 14 days later 'Did this bring you joy?' and builds an Anti-Persona profile of items you always regret buying?"
]

for idea in chain_1:
    append_memlog("idea", idea)

chain_2 = [
    "Yes, and what if instead of a boring static dashboard, your app speaks to you via voice with the actual synthesized persona of your 65-year-old retired future self? (The Future Self Financial Twin)",
    "Yes, and what if your future self's voice tone and mood dynamically degrade (tired, anxious, working late) when you blow your budget, but sounds energized and on vacation when you hit savings milestones?",
    "Yes, and what if when you add an expense via voice in Greek or English ('Spent 80 euros at dinner'), your future self chimes in with a witty, dry remark putting that dinner in perspective with your long-term wealth?",
    "Yes, and what if you can hold a 60-second audio debate with your future self before a big purchase to argue why you need it, and AI scores your argument's validity?",
    "Yes, and what if the AI records your own voice promises ('I will not buy sneakers this month') and plays your own voice back to you when you attempt to log a sneaker purchase?"
]

for idea in chain_2:
    append_memlog("idea", idea)

chain_3 = [
    "Yes, and what if users never categorize a single expense ever again, and instead the app automatically calculates a single daily 'Safe-to-Burn' allowance number? (Zero-Friction Burn Rate)",
    "Yes, and what if unspent daily allowance rolls over into a glowing 'Streak & Combo Multiplier' that unlocks app aesthetics, audio themes, or bonus vault interest?",
    "Yes, and what if overspending today automatically glides and contracts your next 3-4 days smoothly so you never feel the guilt of failing a rigid monthly budget?",
    "Yes, and what if the app integrates an 'Anti-Subscription Bounty Hunter' that detects ghost charges and drafts one-tap cancellation emails or phone scripts in Greek & English?"
]

for idea in chain_3:
    append_memlog("idea", idea)

# Technique 2: Brain Writing Round Robin
switch_technique("Brain Writing Round Robin")

sheet_a = [
    "Ghost Splitting: Split expenses with roommates or friends without them needing the app — sends a zero-app micro-link via WhatsApp with 1-tap instant payment.",
    "Financial Prenup & Duo Mode: Couples share aggregate goal progress and household budget limits while keeping individual personal transactions 100% encrypted and private.",
    "The Accountability & Anti-Charity Pact: Pair with an accountability buddy; if you break your weekend dining limit, the app triggers a €5 micro-penalty to your friend's wallet or an anti-charity.",
    "Household Bounty Board: Family members post chores with bounties; kids or partners claim them, and funds transfer automatically upon photo/OCR verification."
]

for idea in sheet_a:
    append_memlog("idea", idea)

sheet_b = [
    "Geofenced Temptation Shield: When GPS detects you entering high-risk spending zones (shopping malls, nightlife districts), the app triggers Spend Lock requiring a biometric quiz or friction puzzle to log card spend.",
    "Weather & Mood Spending Predictor: Correlates local weather, stress indicators (calendar density), and late-night hours with impulsive spending spikes to warn you beforehand.",
    "Receipt Nutrition & Eco-Scorecard: OCR doesn't just read the total; it parses line items to rate nutritional healthiness and carbon footprint per euro spent.",
    "Smart Price-Drop Protection: Remembers items on scanned receipts and alerts you if the retailer drops the price within the return/refund guarantee window."
]

for idea in sheet_b:
    append_memlog("idea", idea)

sheet_c = [
    "The 'What If I Never Smoked/Drank Coffee' Parallel Universe: A secondary live-updating graph comparing your current net worth to a parallel timeline where you quit a specific vice years ago.",
    "Fantasy Portfolio of Resisted Temptations: When you resist buying an impulse item, tap 'Saved It!' to invest that virtual amount into a simulated index fund and watch your willpower outgrow real purchases.",
    "Financial Freedom Countdown (Time, Not Money): Displays your net worth solely as 'Years, Months, Days of Absolute Life Freedom' with zero required employment.",
    "Mystery Box Automated Micro-Savings: Periodically tucks away unpredictable micro-amounts (€2 to €14) based on cashflow surplus into a high-yield locked digital safe."
]

for idea in sheet_c:
    append_memlog("idea", idea)

# Insights & Synthesis
append_memlog("insight", "Differentiator Pillar 1: 'The Life-Energy & Regret Engine' - Converting currency into hours worked + 14-day regret quotient.", by="coach")
append_memlog("insight", "Differentiator Pillar 2: 'The AI Future Self Voice Twin' - Interactive conversational Greek/English audio avatar that reacts emotionally to budget choices.", by="coach")
append_memlog("insight", "Differentiator Pillar 3: 'Dynamic Daily Safe-to-Burn' - Eliminating painful line-item categorizing in favor of a rolling daily burn allowance with streak combos.", by="coach")
append_memlog("insight", "Differentiator Pillar 4: 'Willpower & Resisted Impulse Portfolio' - Gamified parallel wealth simulator rewarding delayed gratification.", by="coach")

set_status("complete")
print("Brainstorming execution complete.")
