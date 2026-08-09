import random
def row_spin():
    shape=["🍒", "🍉", "🍋", "🔔", "⭐"]
    list_shape=[]
    for x in range(3):
        list_shape.append(random.choice(shape))
    return list_shape

def get_money(row,bet):
    if row[0]==row[1]==row[2]:
        if row[0]=="🍒":
            return bet*3
        elif row[0]=="🍉":
            return bet*4
        elif row[0]=="🍋":
            return bet*5
        elif row[0]=="🔔":
            return bet*6
        elif row[0]=="⭐":
            return bet*10
    return 0


def main():
    balance=100
    print("*****************************")
    print("Welcome to Python Slots ")
    print("Symbols: 🍒 🍉 🍋 🔔 ⭐")
    print("*****************************")

    while balance>=0:
        print(f"current balance: ${balance}")
        bet=input("enter your bet to spin the machine: ")

        if not bet.isdigit:
            print("Invalid input! Please enter a valid number for your bet.")
            continue
        print("-"*30)
        bet=int(bet)
        if bet>balance:
            print("Insufficient funds! Your bet exceeds your current balance.")
            continue
        print("-"*30)
        balance-=bet

        row=row_spin()
        print("**************")
        print(" | ".join(row))
        print("**************")

        money=get_money(row,bet)
        if money>0:
            print(f"You won ${money}")
        else:
            print("Sorry you loss play again to won ")

        balance+=money

        ask=input("Do you want play again (Y/N): ").upper().strip()   
        if ask=="N":
            break




if __name__=="__main__":
    main()