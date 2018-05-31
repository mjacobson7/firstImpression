import { Component, OnInit } from '@angular/core';
import { NavService } from '../../services/nav/nav.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  pageInfo: {title: string, icon: string} = {
    title: 'Account Management',
    icon: 'account_balance'
  };

  constructor(private navService: NavService) {
    this.navService.pageHeaderTitle.next(this.pageInfo);
  }

  ngOnInit() {

  }

}
