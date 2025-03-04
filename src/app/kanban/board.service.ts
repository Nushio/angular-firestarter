import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import * as firebase from "firebase/app";
import { switchMap, map } from "rxjs/operators";
import { Board, Task } from "./board.model";

@Injectable({
  providedIn: "root"
})
export class BoardService {
  constructor(private afAuth: AngularFireAuth, private db: AngularFirestore) {}

  /**
   * Creates a new board for the current user
   */
  async createBoard(data: Board) {
    const user = await this.afAuth.auth.currentUser;
    return this.db.collection("boards").add({
      ...data,
      uid: user.uid,
      tasks: [{ description: "Hello!", label: "yellow" }]
    });
  }

  /**
   * Get all boards owned by current user
   */
  getUserBoards() {
    return this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .collection<Board>("boards", ref =>
              ref.where("uid", "==", user.uid).orderBy("priority")
            )
            .valueChanges({ idField: "id" });
        } else {
          return [];
        }
      })
      // map(boards => boards.sort((a, b) => a.priority - b.priority))
    );
  }

  /**
   * Run a batch write to change the priority of each board for sorting
   */
  sortBoards(boards: Board[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = boards.map(b => db.collection("boards").doc(b.id));
    refs.forEach((ref, idx) => batch.update(ref, { priority: idx }));
    batch.commit();
  }

  /**
   * Delete board
   */
  deleteBoard(boardId: string) {
    return this.db
      .collection("boards")
      .doc(boardId)
      .delete();
  }

  /**
   * Updates the tasks on board
   */
  updateTasks(boardId: string, tasks: Task[]) {
    return this.db
      .collection("boards")
      .doc(boardId)
      .update({ tasks });
  }

  /**
   * Move the tasks on board
   */
  moveTasks(boards: Board[]) {
    const db = firebase.firestore();
    const batch = db.batch();
    const refs = boards.map(b => db.collection("boards").doc(b.id));
    refs.forEach((ref, idx) => {
      batch.update(ref, { tasks: boards[idx].tasks });
    });
    batch.commit();
  }

  /**
   * Remove a specifc task from the board
   */
  removeTask(boardId: string, task: Task) {
    return this.db
      .collection("boards")
      .doc(boardId)
      .update({
        tasks: firebase.firestore.FieldValue.arrayRemove(task)
      });
  }
}
