import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { catchError, map } from 'rxjs/operators';
import { EMPTY, Subject } from 'rxjs';
import { Product } from '../product';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
   
  errorMessage = '';
  private errorMessageSubject= new Subject<string>();
  errorMessge$= this.errorMessageSubject.asObservable();

  constructor(private productService: ProductService) { }

  product$ = this.productService.selectProduct$
  .pipe(
    catchError(err => {
     this.errorMessageSubject.next(err)
     return EMPTY;
    })
  );

  pageTitle$ = this.product$
  .pipe(
    map((p: Product) => 
      p ? `Product Detail for ${p.productName}` : null)
  );

  productSupplier$ = this.productService.selectproductwithSupplier$
  .pipe(
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
     })
  );

}
