import { bootstrapApplication } from '@angular/platform-browser';
import { mainConfig } from './main/main.config';
import { MainComponent } from './main/main.component';

bootstrapApplication(MainComponent, mainConfig).catch((err) => console.error(err));
