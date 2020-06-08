import { Component, OnInit } from '@angular/core';
import { TaskService } from './shared/task.service';
import { element } from 'protractor';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {utils, writeFile} from 'xlsx';

// interface jsPDFWithPlugin extends jsPDF{
//     autotable: (options: UserOptions) => jsPDF;
// }

@Component({
    selector: 'app-task',
    templateUrl: './task.component.html',
    styleUrls: ['./task.component.css'],
    providers: [TaskService]
})
export class TaskComponent implements OnInit {
    taskListArray: any[];
    constructor(private taskService: TaskService) { }

    ngOnInit(): void {
        this.taskService.getTaskList().snapshotChanges().subscribe(item => {
            this.taskListArray = [];
            item.forEach(element => {
                var x = element.payload.toJSON();
                x['key'] = element.key;
                this.taskListArray.push(x);
            })
            this.taskListArray.sort((a, b) => {
                return a.isChecked - b.isChecked;
            })
        })
    }

    onAddClick(task) {
        this.taskService.addTask(task.value);
        task.value = null;
    }
    onCheckClick(task: string, isChecked) {
        this.taskService.checkTask(task, !isChecked);
    }

    onDeleteClick(task: string) {
        if (confirm('Are you sure to delete this record ?') == true) {
            this.taskService.removeTask(task);
        }
    }

    downloadTaskPdf() {
        if (this.taskListArray.length == 0) {
            alert("No Tasks Assigned");
        }
        else {

            let data = [];

            for (let i = 0; i < this.taskListArray.length; i++) {
                let row = [];
                row.push(i + 1);
                row.push(this.taskListArray[i].name);
                row.push(this.taskListArray[i].isChecked ? "Completed" : "Pending");
                data.push(row);
            }

            const doc = new jsPDF();

            doc.autoTable({
                head: [["Index", "Task", "Status"]],
                body: data
            })

            doc.save("Tasks.pdf");
        }
    }

    downloadTaskExcel() {
        if (this.taskListArray.length == 0) {
            alert("No Tasks Assigned");
        }
        else {

            let data = [];

            for (let i = 0; i < this.taskListArray.length; i++) {
                let row = {Index: null, Task: '', Status: ''};
                row.Index = i + 1;
                row.Task = this.taskListArray[i].name;
                row.Status = this.taskListArray[i].isChecked ? "Completed" : "Pending";
                data.push(row);
            }

            let newXlsx = utils.book_new();
            let newSheet = utils.json_to_sheet(data);
            utils.book_append_sheet(newXlsx, newSheet, "Tasks");
            writeFile(newXlsx, "Tasks.xlsx");
            // const doc = new jsPDF();

            // doc.autoTable({
            //     head: [["Index", "Task", "Status"]],
            //     body: data
            // })

            // doc.save("Tasks.pdf");
        }
    }

}
