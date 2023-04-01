import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Message } from '../_models/message';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Group } from '../_models/group';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection; 
  private messageThreadSoure = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSoure.asObservable();

  constructor(private http: HttpClient ) { }

  CreateHubConnection(user: User, otherUsername: string)
  {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory : () => user.token
      })
      .withAutomaticReconnect()
      .build();

      this.hubConnection.start().catch(error => console.log(error));

      this.hubConnection.on("ReceiveMessageThread", messages => {
        this.messageThreadSoure.next(messages);
      })

      this.hubConnection.on('UpdatedGroup', (group : Group) => {
        if(group.connections.some(x => x.userName === otherUsername)) {
          this.messageThread$.pipe(take(1)).subscribe({
            next: messages => {
              messages.forEach(message => {
                if(!message.dateRead) {
                  message.dateRead = new Date(Date.now())
                }
              })
              this.messageThreadSoure.next([...messages]);
            }
          })
        }
      })

      this.hubConnection.on('NewMessage', message => {
        this.messageThread$.pipe(take(1)).subscribe({
          next: messages => {
            this.messageThreadSoure.next([...messages, message])
          }
        })
      })
  }

  stopHubConnection(){
    if(this.hubConnection){
      this.hubConnection.stop();
    }
    
  }

  getMessages(pageNumber: number, pageSize:number, container: string){
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('Container', container);
    return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
  }

  getMessageThread(userName:string){
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + userName);
  }

  async sendMessage(userName:string, content: string){
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: userName, content})
    .catch(error => console.log(error));
  }

  deleteMessage(id : number){
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }

}
