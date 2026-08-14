from bot_logic import get_response

def main_bot():
    print("chatbot: Hi! How can I assist you \"ibrahim ahmed ibrahim mohamed\"?")
    
    while True:
        user_input = input("User:   ").lower()
        
        if user_input == "quit" or user_input == "q" or user_input == "exit":
            print("chatbot: Goodbye!")
            break
            
        response = get_response(user_input)
        print("chatbot:", response)

if __name__ == "__main__":
    main_bot()