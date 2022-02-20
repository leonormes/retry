export interface AsyncCommand<U> {
    execute(): U;
}

export class GetUserSettings<T, U> implements AsyncCommand<Promise<U>> {
    constructor(private fn: (payload?: T) => Promise<U>, private payload?: T) {}

    public async execute(): Promise<U> {
        return await this.fn(this.payload);
    }
}
