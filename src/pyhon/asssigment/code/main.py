import random

responses = {
    "hello": ["Hello!", "Hi there!", "Greetings!"],
    "how are you": ["I'm doing well, thank you!", "I'm fine, how about you?"],
    "goodbye": ["Goodbye!", "See you later!", "Farewell!"],
    "default": ["I'm sorry, I didn't understand.", "Could you please rephrase that?"]
}

def get_random_response(responses_dict, user_input):
    if user_input in responses_dict:
        return random.choice(responses_dict[user_input])
    else:
        return random.choice(responses_dict["default"])

def main_bot():
    print("chatbot: Hi How can i assist you ?")
    
    while True:
        user_input = input("User:   ").lower()
        
        if user_input == "quit" or user_input == "q":
            print("chatbot: Goodbye!")
            break
            
        response = get_random_response(responses, user_input)
        print("chatbot:", response)


main_bot()