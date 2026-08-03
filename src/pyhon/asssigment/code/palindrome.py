def palindrome(word):
    word=word.lower()
    if word==word[::-1]:
        return True
    else:
        return False
user=input("enter your word: ") 
if palindrome(user):
    print(f"{user} is a palindrome.")
else:
    print(f"{user} is not a palindrome.")   
