import random
ROCK="r"
PAPER="p"
SCISSORS="s"
emoji = {ROCK: "🪨", PAPER: "📄", SCISSORS: "✂️"}
choice=tuple(emoji.keys())

def ask_user():
    while True:
        user_input=input("enter yout choice (r for rock, p for paper, s for scissors): ").lower()
        if user_input in choice:
            return user_input
        else:
            print("Invalid input. Please try again.")

def choise_togather(user_input,computer_input):
    print(f"user_choice: {emoji[user_input]}")
    print(f"computer_choice: {emoji[computer_input]}")

def determine_winner(user_input, computer_input):
    if user_input==computer_input:
        return "tie"
    elif user_input=="r" and computer_input=="s":
        return "user"
    elif user_input=="p" and computer_input=="r":
        return "user"
    elif user_input=="s" and computer_input=="p":
        return "user"
    else:
        return "computer"

def play_game():
    win_user=0
    win_computer=0
    tie=0
    
    while True:
        user_input=ask_user()
        computer_input=random.choice(choice)   
        choise_togather(user_input, computer_input)
        result=determine_winner(user_input, computer_input)

        if result == "tie":
            tie += 1
            print("Tie!")
        elif result == "user":
            win_user += 1
            print("User wins!")
        else:
            win_computer += 1
            print("Computer wins!")

        should_continue=input("Do you want to play again? (y/n): ").lower()
        if should_continue!="y":
            print(f"Final Score - User: {win_user}, Computer: {win_computer}, Ties: {tie}")
            print("Thanks for playing!")
            break 
play_game()        

