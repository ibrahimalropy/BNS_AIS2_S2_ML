def factorial(n):
    '''
    calculate n! using Recursion

    Args:
        num (int): user input the int number

    Returns:
        int: return the factorial
    '''
    if n==0 or n==1:
        return 1 
    return n*factorial(n-1)

def is_prium(num):
    """
check for the number is prime or not

Args:
    num(int): number for check
Returns:
    bool: true if that prime or false if that not prime
"""
    if num<=1:
        return False
    for i in range(2,num):
        if num%i==0:
            return False
    return True

def find_common_divisors(num1, num2):
    """
    this function help to calc the common Division
    """

    common_divisors=[]
    min_number=min(num1,num2)

    for i in range(1,min_number+1):
        if num1%i==0 and num2%i==0:
            common_divisors.append(i)

    return common_divisors