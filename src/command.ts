export interface ICommand {
    execute(): any;
}

export class Command<T, U> implements ICommand {
           constructor(private fn: (payload: T | undefined) => Promise<U>, private payload?: T) {
           }

           public async execute(): Promise<U> {
               return await this.fn(this.payload);
           }
       }
