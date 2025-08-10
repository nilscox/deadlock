export interface DatePort {
  now(): Date;
}

export class DateAdapter implements DatePort {
  now(): Date {
    return new Date();
  }
}

export class StubDateAdapter implements DatePort {
  date = new Date();

  now(): Date {
    return this.date;
  }
}
