export interface ICommand {
    execute(): unknown;
}

export class Command<T, U> implements ICommand {
    constructor(private fn: (payload?: T) => Promise<U>, private payload?: T) {}

    public async execute(): Promise<U> {
        return await this.fn(this.payload);
    }
}
