import { Component, Input, OnInit } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { TaskDialogComponent } from "../dialogs/task-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { BoardService } from "../board.service";
import { Board, Task } from "../board.model";

@Component({
  selector: "app-board",
  templateUrl: "./board.component.html",
  styleUrls: ["./board.component.scss"]
})
export class BoardComponent implements OnInit {
  @Input() board: Board;
  @Input() connectedTo: Board[];
  public connectedBoards = [];

  taskDrop(event: CdkDragDrop<string[]>) {
    if (event.container.id !== event.previousContainer.id) {
      var boards: Board[] = [];
      var oldBoard: Board;
      this.connectedTo.forEach(board => {
        if (event.previousContainer.id === board.id) {
          oldBoard = board;
          return;
        }
      });

      const task: Task = oldBoard.tasks[event.previousIndex];
      this.board.tasks.splice(event.currentIndex, 0, task);
      oldBoard.tasks.splice(event.previousIndex, 1);
      boards.push(oldBoard);
      boards.push(this.board);
      this.boardService.moveTasks(boards);
    } else {
      moveItemInArray(
        this.board.tasks,
        event.previousIndex,
        event.currentIndex
      );
      this.boardService.updateTasks(this.board.id, this.board.tasks);
    }
  }

  openDialog(task?: Task, idx?: number): void {
    const newTask = { label: "purple" };
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: "500px",
      data: task
        ? { task: { ...task }, isNew: false, boardId: this.board.id, idx }
        : { task: newTask, isNew: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.isNew) {
          this.boardService.updateTasks(this.board.id, [
            ...this.board.tasks,
            result.task
          ]);
        } else {
          const update = this.board.tasks;
          update.splice(result.idx, 1, result.task);
          this.boardService.updateTasks(this.board.id, this.board.tasks);
        }
      }
    });
  }

  handleDelete() {
    this.boardService.deleteBoard(this.board.id);
  }

  ngOnInit() {
    this.connectedTo.forEach(board => {
      if (board.id !== this.board.id) {
        this.connectedBoards.push(board.id);
      }
    });
  }

  constructor(private boardService: BoardService, private dialog: MatDialog) {}
}
