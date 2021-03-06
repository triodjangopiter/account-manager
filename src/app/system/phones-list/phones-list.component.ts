import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog, MatDialogRef, MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';

import { Phone } from '../shared/model/phone.model';
import { PhoneService } from '../shared/services/phone.service';
import { DialogPhoneComponent } from './dialog-phone/dialog-phone.component';
import { Filters } from '../shared/filters/filters';
import { DialogConfirmationComponent } from '../shared/dialog/dialog-confirmation/dialog-confirmation.component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'am-phones-list',
    templateUrl: './phones-list.component.html',
    styleUrls: ['./phones-list.component.css']
})
export class PhonesListComponent implements OnInit, OnDestroy {
    subscribtions: Subscription[] = [];
    /**
     * Phones data.
     */
    phonesIsLoaded = false;
    phones = new MatTableDataSource<Phone>([]);
    displayedColumns = [
        'id', 
        'number',
        'isActive', 
        'regDate', 
        'operator', 
        'site', 
        'operatorLogin', 
        'operatorPassword', 
        'socialAccountIds',
        'edit',
        'delete'
    ];
    /**
     * Pagination view.
     */
    paginator: MatPaginator;
    @ViewChild(MatPaginator)
    set pagination(paginator : MatPaginator) {
        this.paginator = paginator;
        this.phones.paginator = this.paginator;
    }
    
    filterOpenState : boolean = false;
    filterForm : FormGroup;
    private filters: Filters = new Filters();

    constructor(public dialog: MatDialog, 
                public snackBar: MatSnackBar,
                private phoneService: PhoneService) {
    }

    ngOnInit() {
        this.getPhoneList();
        this.updateFilterInstance();
    }

    /**
     * Applying all filters.
     */
    applyFilter(): void {
        const {id, num, socialAccId, operator, operatorAccLogin, operatorAccPass, dateFrom, dateTo} = this.filterForm.value;
        this.phones = new MatTableDataSource(this.filters.doEqualFilter(this.phones.data, 'id', id));
        this.phones = new MatTableDataSource(this.filters.doIncludeFilter(this.phones.data, 'num', num));
        this.phones = new MatTableDataSource(this.filters.doIncludeFilter(this.phones.data, 'socialAccountIds', socialAccId));
        this.phones = new MatTableDataSource(this.filters.doIncludeFilter(this.phones.data, 'operatorType', operator));
        this.phones = new MatTableDataSource(this.filters.doIncludeFilter(this.phones.data, 'operatorAccLogin', operatorAccLogin));
        this.phones = new MatTableDataSource(this.filters.doIncludeFilter(this.phones.data, 'operatorAccPass', operatorAccPass));
        this.phones = new MatTableDataSource(this.filters.doFilterByDate(this.phones.data, 'regDate', dateFrom, dateTo));
    }
    
    disableFilter(): void {
        this.getPhoneList();
        this.updateFilterInstance();
    }

    /**
     * Handle addition Phone event.
     */
    openDialogAddPhone(): void {
        const sub = this.dialog.open(DialogPhoneComponent, { width: '33%', data: { isActive: 'Active', regDate: new Date() } })
            .afterClosed()
            .subscribe((formData: Phone) => {
                if (!!formData) {
                    this.phoneService.addPhone(formData).subscribe((result: Phone) => this.getPhoneList());
                }
            });
            this.subscribtions.push(sub);
    }

    /**
     * Edit phone obj.
     * 
     * @param phone for eddition.
     */
    openDialogEditPhone(phone: Phone) {
        const oldVersion = JSON.parse(JSON.stringify(phone));
        const sub = this.dialog.open(DialogPhoneComponent, { width: '33%', data: phone })
            .afterClosed().subscribe((updated: Phone) => {
                if (!!updated && JSON.stringify(oldVersion) !== JSON.stringify(updated)) {
                    this.editPhone(updated);
                }
        }); 
        this.subscribtions.push(sub);
    }
    
    /**
     * Exchange old in memory obj Phone version to new version from backend.
     * 
     * @param phone starting state of Phone for edition.
     */
    private editPhone(phone: Phone): void {
        const sub = this.phoneService.updatePhone(phone)
            .subscribe((dbVersion: Phone) => {
                const tmp = this.phones.data;
                const target = tmp.find(localVersion => dbVersion.id === localVersion.id);
                const index = tmp.indexOf(target);
                tmp[index] = dbVersion;
                this.phones = new MatTableDataSource(tmp);
            }, error => alert(error));
            this.subscribtions.push(sub);
    }

    /**
     * Open dialog window for confirm or reject deleting Phone.
     * If user call confirm then call method @see#this.deletePhone(id);
     * 
     * @param id of deleting Phone.
     */
    openDialogDeletePhone(id: number): void {
        const sub = this.dialog.open(DialogConfirmationComponent, {
            width: '300px', data: { massage: `Phone number with ID: ${id} will be permanently deleted!` }
        }).afterClosed().subscribe(confirmed => {
            if (!!confirmed) {
                this.deletePhone(id);
            }
        });
        this.subscribtions.push(sub);
    }

    /**
     * Delete Phone from DB.
     */
    private deletePhone(id: number): void {
        const sub = this.phoneService.deletePhone(id)
            .subscribe(data => {
                const snacConf = new MatSnackBarConfig();
                snacConf.duration = 10000;
                this.snackBar
                    .open(`Phone number with ID: ${id} has been deleted.`, 'OK', snacConf)
                    ._open();
                    this.getPhoneList();
            });
            this.subscribtions.push(sub);
    }

    private updateFilterInstance() : void {
        this.filterForm = new FormGroup({
            'id': new FormControl(null, []),
            'num': new FormControl(null, []),
            'dateFrom': new FormControl(null, []),
            'dateTo': new FormControl(null, []),
            'operator': new FormControl(null, []),
            'operatorAccLogin': new FormControl(null, []),
            'operatorAccPass': new FormControl(null, []),
            'socialAccId': new FormControl(null, []),
        });
    }

    private getPhoneList() {
        const sub = this.phoneService.getPhoneList()
            .subscribe((phones: Phone[]) => {
                this.phones = new MatTableDataSource<Phone>(phones.reverse());
                this.phonesIsLoaded = true;
            });
            this.subscribtions.push(sub);
    }

    ngOnDestroy() {
        if (!!this.subscribtions) {
            this.subscribtions.forEach(sub => {
                if (!!sub) {
                    sub.unsubscribe();
                }
            })
        }
    }
}
