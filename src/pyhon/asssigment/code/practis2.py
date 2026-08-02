tasks=[]
while True:
    print("\nChoose an option:")
    print("1. Add a task")
    print("2. View tasks")
    print("3. Remove a task")
    print("4. Exit")
    chose=int(input("enter your choice task: "))
    if chose==1:
        add_task=input("enter your tasks: ")
        tasks.append(add_task)
    elif chose==2:
        if len(tasks)==0:
            print("No tasks available.")
        else:
            for i,t in enumerate(tasks,1):
                print(f"{i}-{t}")
    elif chose==3:
        if len(tasks)==0:
            print("No tasks available to remove.")
        else:
            for i in tasks:
                delet_task=int(input("enter your number of task to delet: "))
                task_remove=tasks[delet_task-1] 
                tasks.remove(task_remove)
                print(f"Task '{task_remove}' removed successfully.")
                break
    elif chose==4:
        print("Exiting the program.")
        break        