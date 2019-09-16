import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, Observable, of, EMPTY, Subject, combineLatest, BehaviorSubject } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  //errorMessage = '';
  private categorySelectedSubject$ = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject$.asObservable();
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }
  products$ = combineLatest([
    this.productService.productwithAdd$,
    this.categorySelectedAction$
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter(product =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true
    )),
    catchError(err => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  categories$ = this.productCategoryService.productCategories$
    .pipe(
      catchError(err => {
        this.errorMessageSubject.next(err);
        return EMPTY;
      })
    );


  // productSimpleFilter$ = this.productService.productwithcategory$
  // .pipe(
  //   map(products =>
  //       products.filter(product =>
  //         this.selectedCategoryId ? product.categoryId === this.selectedCategoryId : true
  //       )
  //     )
  // );

  // ngOnInit(): void {
  //   // this.products$ = this.productService.getProducts()
  //   // .pipe(
  //   //   catchError(err => {
  //   //     this.errorMessage = err;
  //   //     return EMPTY;
  //   //   })
  //   // );

  // }

  // ngOnDestroy(): void {
  //   //this.sub.unsubscribe();
  // }

onAdd(): void {
  this.productService.addProduct();
 } 

  onSelected(categoryId: string): void {
    this.categorySelectedSubject$.next(+categoryId);
  }
}
