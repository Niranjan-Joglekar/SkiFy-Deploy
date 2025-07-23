def decide_level(questions: list[dict]) -> int:
    # Dummy logic for now
    correct = sum([q["accuracy"] for q in questions])
    if correct >= 2:
        return min(5, questions[-1]["level"] + 1)
    return max(1, questions[-1]["level"] - 1)
