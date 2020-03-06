export interface ICommand {
    execute(): any;
}

export class APICaller<T, U> implements ICommand {
           constructor(private fn: (payload: T | undefined) => Promise<U>, private payload?: T) {
               this.payload = payload;
               this.fn = fn;
           }

           public async execute(): Promise<U> {
               return await this.fn(this.payload);
           }
       }
