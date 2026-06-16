# Predefined benchmarking usecase templates for VoxArena

TEMPLATES = {
    "restaurant": {
        "id": "restaurant",
        "name": "Restaurant Reservation",
        "description": "Book a table for dinner, check parking details, and verify opening hours.",
        "system_prompt": "You are a friendly and helpful virtual reservation assistant for a restaurant. Your goal is to help customers book tables, answer questions about our opening hours, weekend schedule, parking details, and standard menus. You have access to tools: get_hours, lookup_menu, and check_reservation_availability. Ensure you get required parameters before calling reservations.",
        "tools": [
            {
                "name": "lookup_menu",
                "description": "Retrieve the menu items for a specific category.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "description": "The menu category: starters, mains, desserts, or drinks.",
                            "enum": ["starters", "mains", "desserts", "drinks"]
                        }
                    },
                    "required": ["category"]
                }
            },
            {
                "name": "get_hours",
                "description": "Retrieve restaurant operating hours for a specific day of the week.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "day": {
                            "type": "string",
                            "description": "The day of the week (e.g., Monday, Tuesday, Sunday)."
                        }
                    },
                    "required": ["day"]
                }
            },
            {
                "name": "check_reservation_availability",
                "description": "Check table availability for a reservation on a given date, time, and party size.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "date": {
                            "type": "string",
                            "description": "The date of reservation in YYYY-MM-DD format."
                        },
                        "time": {
                            "type": "string",
                            "description": "The time of reservation (e.g. 19:00 or 7:00 PM)."
                        },
                        "party_size": {
                            "type": "integer",
                            "description": "The number of guests."
                        }
                    },
                    "required": ["date", "time", "party_size"]
                }
            }
        ],
        "utterances": [
            {
                "id": "u01",
                "text": "Hi, I'd like to book a table for tomorrow evening.",
                "expect": {"response_contains": ["how many", "party"]}
            },
            {
                "id": "u02",
                "text": "Sure, for 4 people at 7:30 PM under the name Alex.",
                "expect": {
                    # Only assert party_size — time arg format varies wildly
                    # ("19:30" vs "7:30 PM") and the matcher does exact-string compare.
                    "tool": "check_reservation_availability",
                    "args": {"party_size": 4},
                    "response_contains": ["available", "table"]
                }
            },
            {
                "id": "u03",
                "text": "Do you have any outdoor seating or parking facilities?",
                "expect": {"response_contains": ["parking"]}
            },
            {
                "id": "u04",
                "text": "Perfect, and what are your opening hours on weekends?",
                "expect": {
                    "tool": "get_hours",
                    "response_contains": ["open"]
                }
            },
            {
                "id": "u05",
                "text": "Thank you, that's all I need. See you tomorrow!",
                "expect": {"response_contains": ["welcome", "thank"]}
            }
        ]
    },
    "smarthome": {
        "id": "smarthome",
        "name": "Smart Home Automation",
        "description": "Query front door lock status, adjust the thermostat temperature, and turn off light zones.",
        "system_prompt": "You are a helpful smart home AI assistant. Control devices like lights, locks, and thermostats. When asked to lock/unlock, check locks, or adjust temperatures, invoke the corresponding tool to execute the physical command.",
        "tools": [
            {
                "name": "get_device_status",
                "description": "Check if a device is locked, unlocked, on, or off.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "device_name": {"type": "string", "description": "Name of device (e.g. front door)"}
                    },
                    "required": ["device_name"]
                }
            },
            {
                "name": "set_device_status",
                "description": "Lock, unlock, turn on, or turn off a device.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "device_name": {"type": "string", "description": "Name of device"},
                        "status": {"type": "string", "description": "State (e.g. locked, unlocked, on, off)"}
                    },
                    "required": ["device_name", "status"]
                }
            },
            {
                "name": "set_thermostat",
                "description": "Set the thermostat to a target temperature.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "temperature": {"type": "number", "description": "Target temperature in degrees"}
                    },
                    "required": ["temperature"]
                }
            }
        ],
        "utterances": [
            {
                "id": "u01",
                "text": "Hi, is the front door currently locked?",
                "expect": {
                    "tool": "get_device_status",
                    "args": {"device_name": "front door"},
                    "response_contains": ["unlocked"]
                }
            },
            {
                "id": "u02",
                "text": "Okay, please lock it and set the living room thermostat to 72 degrees.",
                "expect": {
                    "tool": "set_thermostat",
                    "args": {"temperature": 72},
                    "response_contains": ["72"]
                }
            },
            {
                "id": "u03",
                "text": "Can you turn off all the lights in the kitchen and garage?",
                "expect": {
                    "tool": "set_device_status",
                    "args": {"device_name": "kitchen lights", "status": "off"},
                    "response_contains": ["off"]
                }
            },
            {
                "id": "u04",
                "text": "Awesome, thank you, that is all.",
                "expect": {"response_contains": ["welcome", "anything else"]}
            }
        ]
    },
    "finance": {
        "id": "finance",
        "name": "Financial Fund Transfer",
        "description": "Check current checking account balance and initiate a transfer from savings to checking.",
        "system_prompt": "You are a secure banking assistant. Assist users with balance queries and transferring funds between accounts.",
        "tools": [
            {
                "name": "get_account_balance",
                "description": "Check current balance of checking or savings account.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "account_type": {"type": "string", "description": "checking or savings"}
                    },
                    "required": ["account_type"]
                }
            },
            {
                "name": "transfer_funds",
                "description": "Transfer funds between checking and savings accounts.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "from_account": {"type": "string", "description": "Source account"},
                        "to_account": {"type": "string", "description": "Destination account"},
                        "amount": {"type": "number", "description": "Amount to transfer"}
                    },
                    "required": ["from_account", "to_account", "amount"]
                }
            }
        ],
        "utterances": [
            {
                "id": "u01",
                "text": "Hey, what is the current balance of my checking account?",
                "expect": {
                    "tool": "get_account_balance",
                    "args": {"account_type": "checking"},
                    "response_contains": ["1,500", "balance"]
                }
            },
            {
                "id": "u02",
                "text": "I'd like to transfer two hundred dollars from my savings to checking.",
                "expect": {
                    "tool": "transfer_funds",
                    "args": {"from_account": "savings", "to_account": "checking", "amount": 200},
                    "response_contains": ["transfer"]
                }
            },
            {
                "id": "u03",
                "text": "Yes, please proceed with the transfer.",
                "expect": {"response_contains": ["transfer", "complete"]}
            }
        ]
    },
    "flight": {
        "id": "flight",
        "name": "Flight Check-in",
        "description": "Look up a flight status, select a seat, and add a checked bag before departure.",
        "system_prompt": "You are a helpful airline check-in assistant. Help passengers look up their flight status, choose seats, and manage baggage. Always confirm the flight number before calling any tools.",
        "tools": [
            {
                "name": "get_flight_status",
                "description": "Look up real-time status and gate information for a flight.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "flight_number": {"type": "string", "description": "Flight number (e.g. AA204)"},
                        "date": {"type": "string", "description": "Travel date in YYYY-MM-DD format"}
                    },
                    "required": ["flight_number", "date"]
                }
            },
            {
                "name": "select_seat",
                "description": "Reserve a specific seat for a passenger on a flight.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "flight_number": {"type": "string", "description": "Flight number"},
                        "seat": {"type": "string", "description": "Seat number (e.g. 14A)"},
                        "passenger_name": {"type": "string", "description": "Full name of the passenger"}
                    },
                    "required": ["flight_number", "seat", "passenger_name"]
                }
            },
            {
                "name": "add_checked_bag",
                "description": "Add a checked baggage allowance to a booking.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "flight_number": {"type": "string", "description": "Flight number"},
                        "bag_count": {"type": "integer", "description": "Number of checked bags to add"}
                    },
                    "required": ["flight_number", "bag_count"]
                }
            }
        ],
        "utterances": [
            {
                "id": "u01",
                "text": "Hi, I'm flying on AA204 tomorrow and want to check if it's on time.",
                "expect": {
                    "tool": "get_flight_status",
                    "args": {"flight_number": "AA204"},
                    "response_contains": ["gate", "on time"]
                }
            },
            {
                "id": "u02",
                "text": "Great, can I pick seat 14A? My name is Jordan Smith.",
                "expect": {
                    "tool": "select_seat",
                    "args": {"flight_number": "AA204", "seat": "14A", "passenger_name": "Jordan Smith"},
                    "response_contains": ["14A", "confirmed"]
                }
            },
            {
                "id": "u03",
                "text": "I also need to add one checked bag to my booking.",
                "expect": {
                    "tool": "add_checked_bag",
                    "args": {"flight_number": "AA204", "bag_count": 1},
                    "response_contains": ["bag", "added"]
                }
            },
            {
                "id": "u04",
                "text": "Perfect, that's everything. Thank you!",
                "expect": {"response_contains": ["welcome", "safe"]}
            }
        ]
    },
    "healthcare": {
        "id": "healthcare",
        "name": "Healthcare Appointment",
        "description": "Check doctor availability, book an appointment, and request a prescription refill.",
        "system_prompt": "You are a virtual healthcare scheduling assistant. Help patients check doctor availability, book or reschedule appointments, and request prescription refills. Always confirm the patient's date of birth before accessing their records.",
        "tools": [
            {
                "name": "check_doctor_availability",
                "description": "Check available appointment slots for a doctor on a given date.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "doctor_name": {"type": "string", "description": "Name of the doctor"},
                        "date": {"type": "string", "description": "Requested date in YYYY-MM-DD format"}
                    },
                    "required": ["doctor_name", "date"]
                }
            },
            {
                "name": "book_appointment",
                "description": "Book an appointment slot for a patient.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "doctor_name": {"type": "string", "description": "Name of the doctor"},
                        "date": {"type": "string", "description": "Appointment date in YYYY-MM-DD format"},
                        "time": {"type": "string", "description": "Appointment time (e.g. 10:00 AM)"},
                        "patient_name": {"type": "string", "description": "Full name of the patient"}
                    },
                    "required": ["doctor_name", "date", "time", "patient_name"]
                }
            },
            {
                "name": "request_prescription_refill",
                "description": "Submit a refill request for an existing prescription.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "patient_name": {"type": "string", "description": "Full name of the patient"},
                        "medication_name": {"type": "string", "description": "Name of the medication to refill"}
                    },
                    "required": ["patient_name", "medication_name"]
                }
            }
        ],
        "utterances": [
            {
                "id": "u01",
                "text": "Hi, I'd like to see Dr. Patel next Tuesday for a check-up.",
                "expect": {
                    "tool": "check_doctor_availability",
                    "args": {"doctor_name": "Dr. Patel"},
                    "response_contains": ["available", "slot"]
                }
            },
            {
                "id": "u02",
                "text": "The 10 AM slot works. My name is Sam Rivera.",
                "expect": {
                    "tool": "book_appointment",
                    "args": {"doctor_name": "Dr. Patel", "time": "10:00 AM", "patient_name": "Sam Rivera"},
                    "response_contains": ["confirmed", "appointment"]
                }
            },
            {
                "id": "u03",
                "text": "While I have you, can you also put in a refill for my metformin?",
                "expect": {
                    "tool": "request_prescription_refill",
                    "args": {"patient_name": "Sam Rivera", "medication_name": "metformin"},
                    "response_contains": ["refill", "submitted"]
                }
            },
            {
                "id": "u04",
                "text": "That's all, thanks so much.",
                "expect": {"response_contains": ["welcome", "see you"]}
            }
        ]
    },
    "ecommerce": {
        "id": "ecommerce",
        "name": "Order Tracking & Returns",
        "description": "Track an order, report a missing item, and initiate a return for a delivered package.",
        "system_prompt": "You are an e-commerce customer support assistant. Help customers track orders, report missing or damaged items, and start the return process. Always look up the order before taking any action.",
        "tools": [
            {
                "name": "track_order",
                "description": "Look up the current status and estimated delivery date of an order.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Order ID (e.g. ORD-8821)"}
                    },
                    "required": ["order_id"]
                }
            },
            {
                "name": "report_issue",
                "description": "Report a problem with a delivered order (missing item, damaged goods, wrong item).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Order ID"},
                        "issue_type": {
                            "type": "string",
                            "description": "Type of issue.",
                            "enum": ["missing_item", "damaged", "wrong_item"]
                        },
                        "description": {"type": "string", "description": "Brief description of the problem"}
                    },
                    "required": ["order_id", "issue_type"]
                }
            },
            {
                "name": "initiate_return",
                "description": "Start a return request and generate a return shipping label.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "order_id": {"type": "string", "description": "Order ID"},
                        "reason": {"type": "string", "description": "Reason for return (e.g. defective, wrong size, changed mind)"}
                    },
                    "required": ["order_id", "reason"]
                }
            }
        ],
        "utterances": [
            {
                "id": "u01",
                "text": "Hey, I placed order ORD-8821 last week and haven't received it yet.",
                "expect": {
                    "tool": "track_order",
                    "args": {"order_id": "ORD-8821"},
                    "response_contains": ["delivery", "status"]
                }
            },
            {
                "id": "u02",
                "text": "It says delivered but one of the items is missing from the box.",
                "expect": {
                    "tool": "report_issue",
                    "args": {"order_id": "ORD-8821", "issue_type": "missing_item"},
                    "response_contains": ["reported", "sorry"]
                }
            },
            {
                "id": "u03",
                "text": "Actually I'd like to just return the whole order. It's not what I expected.",
                "expect": {
                    "tool": "initiate_return",
                    "args": {"order_id": "ORD-8821"},
                    "response_contains": ["return", "label"]
                }
            },
            {
                "id": "u04",
                "text": "Great, thank you for your help.",
                "expect": {"response_contains": ["welcome", "refund"]}
            }
        ]
    },
    "dryrun": {
        "id": "dryrun",
        "name": "Dry Run Baseline",
        "description": "Basic greeting, simple fact retrieval, and farewell to check latency and socket health.",
        "system_prompt": "You are a simple assistant for latency sanity testing. Answer questions briefly. Do not use tools.",
        "tools": [],
        "utterances": [
            {
                "id": "u01",
                "text": "Hello, can you hear me?",
                "expect": {"response_contains": ["yes", "hear"]}
            },
            {
                "id": "u02",
                "text": "What is the capital of France?",
                "expect": {"response_contains": ["paris"]}
            },
            {
                "id": "u03",
                "text": "Perfect, thank you, goodbye.",
                "expect": {"response_contains": ["bye", "welcome"]}
            }
        ]
    }
}


def mock_execute_smarthome(name: str, args: dict) -> str:
    """Mock tool responses for Smart Home Automation usecase."""
    if name == "get_device_status":
        return f"The {args.get('device_name') or 'front door'} is currently unlocked."
    if name == "set_device_status":
        return f"The {args.get('device_name') or 'kitchen lights'} status has been updated to {args.get('status') or 'off'}."
    if name == "set_thermostat":
        return f"The living room thermostat has been set to {args.get('temperature') or 72} degrees."
    return f"Tool {name} executed successfully."


def mock_execute_finance(name: str, args: dict) -> str:
    """Mock tool responses for Financial Fund Transfer usecase."""
    if name == "get_account_balance":
        return f"The current balance for your {args.get('account_type') or 'checking'} account is $1,500.00."
    if name == "transfer_funds":
        return f"Successfully transferred ${args.get('amount') or 200} from {args.get('from_account') or 'savings'} to {args.get('to_account') or 'checking'}."
    return f"Tool {name} executed successfully."


def mock_execute_flight(name: str, args: dict) -> str:
    """Mock tool responses for Flight Check-in usecase."""
    if name == "get_flight_status":
        flight = args.get("flight_number", "AA204")
        return f"{flight} is on time. Departure gate is B14. Estimated departure 08:45 AM."
    if name == "select_seat":
        seat = args.get("seat", "14A")
        passenger = args.get("passenger_name", "passenger")
        return f"Seat {seat} has been confirmed for {passenger}."
    if name == "add_checked_bag":
        count = args.get("bag_count", 1)
        return f"{count} checked bag(s) added to your booking. Fee of $35 applied."
    return f"Tool {name} executed successfully."


def mock_execute_healthcare(name: str, args: dict) -> str:
    """Mock tool responses for Healthcare Appointment usecase."""
    if name == "check_doctor_availability":
        doctor = args.get("doctor_name", "Dr. Patel")
        date = args.get("date", "next Tuesday")
        return f"{doctor} has available slots on {date} at 9:00 AM, 10:00 AM, and 2:30 PM."
    if name == "book_appointment":
        doctor = args.get("doctor_name", "Dr. Patel")
        time = args.get("time", "10:00 AM")
        patient = args.get("patient_name", "patient")
        return f"Appointment confirmed for {patient} with {doctor} at {time}. You will receive a reminder 24 hours before."
    if name == "request_prescription_refill":
        med = args.get("medication_name", "medication")
        patient = args.get("patient_name", "patient")
        return f"Refill request for {med} submitted for {patient}. It will be ready for pickup in 2 business days."
    return f"Tool {name} executed successfully."


def mock_execute_ecommerce(name: str, args: dict) -> str:
    """Mock tool responses for Order Tracking & Returns usecase."""
    if name == "track_order":
        oid = args.get("order_id", "ORD-8821")
        return f"Order {oid} was marked as delivered on June 14th. Last scan: front door."
    if name == "report_issue":
        oid = args.get("order_id", "ORD-8821")
        issue = args.get("issue_type", "missing_item")
        return f"Issue '{issue}' reported for order {oid}. A support ticket has been created and our team will follow up within 24 hours."
    if name == "initiate_return":
        oid = args.get("order_id", "ORD-8821")
        return f"Return initiated for order {oid}. A prepaid shipping label has been emailed to you. Refund will be processed within 5–7 business days once received."
    return f"Tool {name} executed successfully."


import os
import json
from voxarena.config import settings

# BUILTIN_TEMPLATES is the source of truth used to SEED the SQLite `templates`
# table on first start and to RESTORE built-ins when the user hits "Reset All
# Data" in the Danger Zone. After seeding, the live template store is the DB —
# user edits to built-in name/prompt/tools/utterances persist across restarts.
BUILTIN_TEMPLATES = TEMPLATES

# Legacy file from the pre-DB era. If it exists on first start, we migrate its
# contents into the templates table (as custom templates) and then leave the
# file alone. Subsequent edits go to the DB.
_LEGACY_CUSTOM_TEMPLATES_FILE = os.path.join(settings.SCRIPT_DIR, "custom_templates.json")


def _bootstrap_templates_into_db() -> None:
    """Seed built-ins on first start; one-time migrate legacy custom_templates.json.

    Idempotent: skips built-ins that already exist (so user edits persist), and
    skips the legacy migration once any custom row is present in the table.
    """
    from voxarena.database import (
        seed_builtin_templates,
        get_template_db,
        upsert_template_db,
        _ensure_initialized,
    )

    try:
        _ensure_initialized()
        # Remove built-ins that no longer exist in BUILTIN_TEMPLATES (e.g. telecom).
        from voxarena.database import get_db_connection
        with get_db_connection() as conn:
            rows = conn.execute(
                "SELECT id FROM templates WHERE is_builtin = 1;"
            ).fetchall()
            stale = [r["id"] for r in rows if r["id"] not in BUILTIN_TEMPLATES]
            if stale:
                conn.execute(
                    f"DELETE FROM templates WHERE id IN ({','.join('?' * len(stale))});",
                    stale,
                )
                conn.commit()
                from loguru import logger
                logger.info(f"Removed {len(stale)} stale built-in template(s): {stale}")
        seeded = seed_builtin_templates(BUILTIN_TEMPLATES, force=False)
        if seeded:
            from loguru import logger
            logger.info(f"Seeded {seeded} built-in template(s) into SQLite.")
    except Exception as e:
        from loguru import logger
        logger.error(f"Failed to seed built-in templates: {e}")
        return

    # Legacy migration: pull anything from custom_templates.json that isn't
    # already in the DB. Only runs as long as the legacy file is around.
    if os.path.exists(_LEGACY_CUSTOM_TEMPLATES_FILE):
        try:
            with open(_LEGACY_CUSTOM_TEMPLATES_FILE, "r") as f:
                legacy = json.load(f)
            migrated = 0
            for tid, tinfo in (legacy or {}).items():
                if get_template_db(tid) is None:
                    payload = dict(tinfo)
                    payload["id"] = tid
                    payload["is_builtin"] = False
                    upsert_template_db(payload)
                    migrated += 1
            if migrated:
                from loguru import logger
                logger.info(f"Migrated {migrated} custom template(s) from legacy file into SQLite.")
        except Exception as e:
            from loguru import logger
            logger.warning(f"Skipping legacy custom_templates.json migration: {e}")


# Eagerly bootstrap on import so any caller that queries templates sees them.
try:
    _bootstrap_templates_into_db()
except Exception:
    pass
