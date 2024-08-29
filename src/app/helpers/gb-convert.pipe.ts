import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gbConvert',
  standalone: true
})
export class GbConvertPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    return (value / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

}
