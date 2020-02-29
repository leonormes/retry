export interface Command {
    execute(): any;
}

export class APICaller<T, U> implements Command {
           constructor(private fn: (payload: U | undefined) => Promise<T>, private payload?: U) {
               this.payload = payload;
               this.fn = fn;
           }

           public async execute(): Promise<T> {
               return await this.fn(this.payload);
           }
       }
