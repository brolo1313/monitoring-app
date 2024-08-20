import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'round',
  standalone: true
})
export class RoundMath implements PipeTransform {
  transform(input: any) {
    return Math.floor(input);
  }
}