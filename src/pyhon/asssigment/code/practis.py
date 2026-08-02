{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "2dfec2fc",
   "metadata": {},
   "outputs": [
    {
     "name": "stdout",
     "output_type": "stream",
     "text": [
      "you gausse is high\n",
      "you gausse is high\n",
      "you gausse is high\n",
      "you gausse is low\n",
      "you gausse is high\n",
      "you guessrd it right in 6\n"
     ]
    }
   ],
   "source": [
    "import random\n",
    "computer_choice=random.randint(1,10)\n",
    "chanc=0\n",
    "while True:\n",
    "    guess_num=int(input(\"Guess a number between 1 and 10:\"))\n",
    "    chanc+=1\n",
    "    if guess_num==computer_choice:\n",
    "        print(f\"you guessrd it right in {chanc} and the number is {computer_choice}\")\n",
    "        break\n",
    "    elif guess_num<computer_choice:\n",
    "        print(\"you gausse is low\")\n",
    "    else:\n",
    "        print(\"you gausse is high\")\n",
    "\n"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "codemirror_mode": {
    "name": "ipython",
    "version": 3
   },
   "file_extension": ".py",
   "mimetype": "text/x-python",
   "name": "python",
   "nbconvert_exporter": "python",
   "pygments_lexer": "ipython3",
   "version": "3.13.2"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}
