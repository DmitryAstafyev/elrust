import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PairsModule } from '@elements/pairs/module';
import { DialogsModule } from '@ui/views/dialogs/module';
import { SettingsModule } from '@ui/tabs/settings/module';
import { ChangelogModule } from '@ui/tabs/changelogs/module';
import { HelpModule } from '@ui/tabs/help/module';

@NgModule({
    imports: [CommonModule],
    declarations: [],
    exports: [PairsModule, SettingsModule, ChangelogModule, HelpModule],
    bootstrap: [PairsModule, DialogsModule, SettingsModule, ChangelogModule, HelpModule],
})
export class TabsModule {}
