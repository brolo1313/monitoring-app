import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { SystemInfoService } from '../../services/system-info-service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
  <div class="footer" @footerAnimation>
    <div class="download-wrapper">
      <a (click)="this.downloadDataAsFile(this.systemData, 'system-info.txt')"
        ><span>Download</span><span>SYS</span></a
      >
      <a (click)="downloadLog()"><span>Download</span><span>Log</span></a>
    </div>

    <div class="update-msg-wrapper">
      <span class="color_white">{{ message }}</span>
    </div>
  </div>
`,
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('footerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('1s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FooterComponent {

  @Input() systemData: any;
  @Input() message!: string;


  systemInfoService = inject(SystemInfoService);

  downloadDataAsFile(data: any, filename: string = 'data.txt') {
    try {
      // Convert the object to a JSON string
      const jsonStr = JSON.stringify(data, null, 2); // pretty print with 2 spaces
  
      // Create a blob from the JSON string
      const blob = new Blob([jsonStr], { type: 'application/json' });
  
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
  
      // Simulate a click on the link to start the download
      a.click();
  
      // Clean up by revoking the object URL
      window.URL.revokeObjectURL(url);
      console.log('url', url);
      console.log('data on load', data);
    } catch (error) {
      console.error('Failed to download the file:', error);
    }
  }


  downloadLog() {
    this.systemInfoService.getLogFile()
      .then((data) => {
        if (data) {
          console.log('asd');
          const blob = new Blob([data], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'main.log';
          a.click();
          window.URL.revokeObjectURL(url);
        }
      })
      .catch((error) => {
        console.error('Failed to download the log file:', error);
      });
  }
}
