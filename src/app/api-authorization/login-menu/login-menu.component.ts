import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { AuthorizeService } from '../authorize.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-login-menu',
  templateUrl: './login-menu.component.html',
  styleUrls: ['./login-menu.component.css']
})
export class LoginMenuComponent implements OnInit {
  public isAuthenticated: Observable<boolean> | undefined;
    public userName: Observable<string> | any;
    public profile: Observable<any> | undefined;
    public role: Observable<string[]> | undefined
    showMenuBool = false;
    @Output() clickOutside = new EventEmitter<void>();
    @Output() showMenuClick = new EventEmitter<boolean>();


  constructor(private authorizeService: AuthorizeService, private elementRef: ElementRef) { }
  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      console.log('outside click xx');
      this.clickOutside.emit();
    }
  }
  ngOnInit() {
    this.authorizeService.checkSignIn();
    this.isAuthenticated = this.authorizeService.isAuthenticated();
      this.userName = this.authorizeService.getUser().pipe(map(u => u && u.profile.name));
      this.profile = this.authorizeService.getUser().pipe(map(u => u && u.profile));
      this.role = this.authorizeService.getUser().pipe(map(u => u && u.profile.role));
      this.authorizeService.getUser().pipe(map(u => console.log(u)));
  }
  showMenu(show: boolean){
    this.showMenuBool = show;
    this.showMenuClick.emit(show);
  }
}
