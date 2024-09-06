import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  @Input() tabs: { label: string, id: string }[] = [];
  selectedTabIndex = 0;

  selectTab(index: number): void {
    this.selectedTabIndex = index;
  }
}
