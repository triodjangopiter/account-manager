import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';

import { Phone } from '../shared/model/phone.model';
import { PhoneService } from '../shared/services/phone.service';

@Component({
    selector: 'am-phones-list',
    templateUrl: './phones-list.component.html',
    styleUrls: ['./phones-list.component.css']
})
export class PhonesListComponent implements OnInit {
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
        'socialAccountIds'
    ];
    /**
     * Pagination view.
     */
    paginator: MatPaginator;
    @ViewChild(MatPaginator)
    set appBacon(paginator : MatPaginator) {
        this.paginator = paginator;
        this.phones.paginator = this.paginator;
    }
    
    filterOpenState : boolean = false;
    filterForm : FormGroup;

    constructor(private phoneService: PhoneService) {
    }

    ngOnInit() {
        this.getPhoneList();
        this.updateFilterInstance();
    }

    /**
     * Applying all filters.
     */
    applyFilter(): void {
        this.filterById();
        this.filterByNumber();
        this.filterBySocialAccountId();
        this.filterByGSMOperator();
        this.filterByOperatorLogin();
        this.filterByOperatorPassword();
        this.filterByRegDate();
    }
    
    disableFilter(): void {
        this.getPhoneList();
        this.updateFilterInstance();
    }

    private filterById(): void {
        const { id } = this.filterForm.value;
        if (!!id && id !== '') {
            const data = this.phones.data.filter((phone: Phone) => id == phone.id);
            this.phones = new MatTableDataSource<Phone>(data);
        }
    }

    private filterByNumber(): void {
        const { num } = this.filterForm.value;
        if (!!num && num !== '') {
            const data = this.phones.data.filter((phone: Phone) => phone.num.indexOf(num) !== -1);
            this.phones = new MatTableDataSource<Phone>(data);
        }
    }

    private filterBySocialAccountId(): void {
        const { operator } = this.filterForm.value;
        if (!!operator && operator !== '') {
            const data = this.phones.data.filter((phone: Phone) => phone.operatorType.indexOf(operator) !== -1);
            this.phones = new MatTableDataSource<Phone>(data);
        }
    }

    private filterByGSMOperator(): void {
        const { socialAccId } = this.filterForm.value;
        if (!!socialAccId && socialAccId !== '') {
            const data = this.phones.data.filter((phone: Phone) => phone.socialAccountIds.indexOf(socialAccId) !== -1);
            this.phones = new MatTableDataSource<Phone>(data);
        }
    }

    private filterByOperatorLogin(): void {
        const { operatorAccLogin } = this.filterForm.value;
        if (!!operatorAccLogin && operatorAccLogin !== '') {
            const data = this.phones.data.filter((phone: Phone) => phone.operatorAccLogin.indexOf(operatorAccLogin) !== -1);
            this.phones = new MatTableDataSource<Phone>(data);
        }
    }

    private filterByOperatorPassword(): void {
        const { operatorAccPass } = this.filterForm.value;
        if (!!operatorAccPass && operatorAccPass !== '') {
            const data = this.phones.data.filter((phone: Phone) => phone.operatorAccPass.indexOf(operatorAccPass) !== -1);
            this.phones = new MatTableDataSource<Phone>(data);
        }
    }

    private filterByRegDate(): void {
        const { dateFrom, dateTo } = this.filterForm.value;
        if (!!dateFrom && !!dateTo) {
            const from = moment(dateFrom, 'MM-DD-YYYY');
            const to = moment(dateTo, 'MM-DD-YYYY');
            const data = this.phones.data.filter((phone: Phone) => {
                if (!phone.regDate) {
                    return false;
                }
                const regDate = moment(phone.regDate, 'DD-MM-YYYY')
                return regDate.isBetween(from, to, 'days', '[]');
            });
            this.phones = new MatTableDataSource<Phone>(data);
        }
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
        this.phoneService.getPhoneList()
            .subscribe((phones: Phone[]) => {
                this.phones = new MatTableDataSource<Phone>(phones);
                this.phonesIsLoaded = true;
            });
    }
}
