import { Component, } from '@angular/core';

import { Subscription, EMPTY, Subject } from 'rxjs';

import { Product } from '../product';
import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list-alt.component.html'
})
export class ProductListAltComponent  {
  pageTitle = 'Products';
  errorMessage = '';
  selectedProductId;

  private errorMessgeSubject = new Subject<string>();
  errorMessage$ = this.errorMessgeSubject.asObservable();

  products: Product[] = [];
  sub: Subscription;

  constructor(private productService: ProductService) { }

  // ngOnInit(): void {
  //   // this.sub = this.productService.getProducts().subscribe(
  //   //   products => this.products = products,
  //   //   error => this.errorMessage = error
  //   // );
  // }

  products$ = this.productService.productwithcategory$
  .pipe(
    catchError(err => {
      this.errorMessgeSubject.next(err);
      return EMPTY;
    })
  );

  selectedProduct$ = this.productService.selectProduct$;

  onSelected(productId: number): void {
    this.productService.selectedProductChanged(+productId);
  }
}
