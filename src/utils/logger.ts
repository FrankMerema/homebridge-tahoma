export class Logger {

    private logger: any;

    constructor(logger: any) {
        this.logger = logger;
    }

    debug(message: string): void {
        this.logger.debug(message);
    }

    info(message: string): void {
        this.logger.info(message);
    }

    error(message: string): void {
        this.logger.error(message);
    }
}
