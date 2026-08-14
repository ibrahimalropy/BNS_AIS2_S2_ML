input_list = ["amit", "learning", "python", "machine learning", "data science", "deep learning"]
item_to_remove=input("enter your item to remove: ")
if item_to_remove in input_list :
    input_list.remove(item_to_remove)
    print("Updated list:")
    print(input_list)
else:
    print(f"{item_to_remove} is not in list ")    