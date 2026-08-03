import random
from termcolor import cprint

def show_question(index,question, options):
    print(f" Question {index}: {question}")
    for p in options:
        print(p)
    return input("you answer:").upper().strip()

def run_quiz(quiz):
    random.shuffle(quiz)
    score=0
    for i , item in enumerate(quiz,1):
        answer=show_question(i,item["question"],item["options"])
        if answer==item["answer"]:
            cprint("Correct ✅","green")
            score+=1
        else:
            cprint(f"your answer is wrong and the correct answer is {item['answer']} ❎","red")  
    print(f"your final score : {score}/{len(quiz)}")          






quiz = [
        {
            "question": 'Which country won the FIFA World Cup in 2022?',
            "options": ['A. Brazil', 'B. France', 'C. Argentina', 'D. Germany'],
            "answer": 'C'
        },
        {
            "question": 'Who has won the most Ballon d\'Or awards in history?',
            "options": ['A. Cristiano Ronaldo', 'B. Lionel Messi', 'C. Pelé', 'D. Diego Maradona'],
            "answer": 'B'
        },
        {
            "question": 'Which club is known as "The Red Devils"?',
            "options": ['A. Real Madrid', 'B. Liverpool', 'C. Manchester United', 'D. AC Milan'],
            "answer": 'C'
        },
        {
            "question": 'Who is the all-time top scorer in the UEFA Champions League?',
            "options": ['A. Lionel Messi', 'B. Robert Lewandowski', 'C. Karim Benzema', 'D. Cristiano Ronaldo'],
            "answer": 'D'
        },
        {
            "question": 'Which country hosted the 2014 FIFA World Cup?',
            "options": ['A. South Africa', 'B. Brazil', 'C. Russia', 'D. Qatar'],
            "answer": 'B'
        },
        {
            "question": 'Which player is nicknamed "CR7"?',
            "options": ['A. Cristiano Ronaldo', 'B. Neymar Jr', 'C. Kylian Mbappé', 'D. Kevin De Bruyne'],
            "answer": 'A'
        },
        {
            "question": 'Which stadium is known as the "Theatre of Dreams"?',
            "options": ['A. Camp Nou', 'B. Santiago Bernabéu', 'C. Anfield', 'D. Old Trafford'],
            "answer": 'D'
        },
        {
            "question": 'Which national team is nicknamed "La Albiceleste"?',
            "options": ['A. Brazil', 'B. Argentina', 'C. Italy', 'D. Spain'],
            "answer": 'B'
        },
        {
            "question": 'Who won the FIFA World Cup in 2018?',
            "options": ['A. Croatia', 'B. Germany', 'C. France', 'D. Brazil'],
            "answer": 'C'
        },
        {
            "question": 'Which goalkeeper is famous for the "Scorpion Kick"?',
            "options": ['A. Manuel Neuer', 'B. Gianluigi Buffon', 'C. René Higuita', 'D. Iker Casillas'],
            "answer": 'C'
        },
        {
            "question":"How the goat of all time ?",
            "options":["A. Cristiano Ronaldo","B. Messi","C. Neymar","D. Mohamed Salah"],
            "answer":"A"
        }
    ]
run_quiz(quiz)
