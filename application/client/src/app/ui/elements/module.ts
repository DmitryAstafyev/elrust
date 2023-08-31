import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContainersModule } from '@elements/containers/module';
import { TabsModule } from '@elements/tabs/module';
import { LocksHistoryModule } from '@elements/locks.history/module';
import { AutocompleteModule } from '@elements/autocomplete/module';
import { ComTooltipComponent } from '@elements/tooltip/component';

@NgModule({
    imports: [CommonModule, ContainersModule, TabsModule, LocksHistoryModule, AutocompleteModule],
    declarations: [ComTooltipComponent],
    exports: [ContainersModule, TabsModule, LocksHistoryModule, AutocompleteModule],
    bootstrap: [ContainersModule, TabsModule, LocksHistoryModule, AutocompleteModule],
})
export class ElementsModule {}
