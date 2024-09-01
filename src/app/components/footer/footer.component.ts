import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { SystemInfoService } from '../../services/system-info-service';

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
})
export class FooterComponent {

  @Input() systemData: any;
  @Input() message!: string;


  systemInfoService = inject(SystemInfoService);

  downloadDataAsFile(data: any, filename: string = 'data.txt') {
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
