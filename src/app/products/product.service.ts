import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge, from } from 'rxjs';
import { catchError, tap, map, scan, shareReplay, mergeMap, toArray, filter, switchMap } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { promise } from 'protractor';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { format } from 'util';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private http: HttpClient,
    private productCategoryService: ProductCategoryService,
    private supplierService: SupplierService
  ) { }
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  // getProducts(): Observable<Product[]> {
  //   return this.http.get<Product[]>(this.productsUrl)
  //     .pipe(
  //       tap(data => console.log('Products: ', JSON.stringify(data))),
  //       catchError(this.handleError)
  //     );
  // }

  // declartive approch
  //  product$ = this.http.get<Product[]>(this.productsUrl)
  //  .pipe(
  //    map(products => products.map(product => ({
  //       ...product,
  //       price: product.price * 1.5,
  //       searchKey : [product.productName]
  //    }) as Product)),
  //   tap(data => console.log('Products: ', JSON.stringify(data))),
  //   catchError(this.handleError)
  //  );

  product$ = this.http.get<Product[]>(this.productsUrl).pipe(
    tap(data => console.log('Products: ', JSON.stringify(data))),

    catchError(this.handleError)
  );

  // combine two different observables
  productwithcategory$ = combineLatest([
    this.product$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(
        product =>
          ({
            ...product,
            price: product.price * 1.5,
            category: categories.find(c => product.categoryId === c.id).name,
            searchKey: [product.productCode]
          } as Product)
      )
    ),
    shareReplay(1),
  );

  private productselectSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productselectSubject.asObservable();
  private productInsertedSubject = new Subject<Product>();
  productInsertedAction$ = this.productInsertedSubject.asObservable();

  selectProduct$ = combineLatest([
    this.productwithcategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, selectedProductId]) =>
      products.find(product => product.id === selectedProductId)
    ),
    tap(product => console.log('Selected Product', product))
  );

  productwithAdd$ = merge(
    this.productwithcategory$,
    this.productInsertedAction$
  ).pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
  );

  // selectproductwithSupplier$ = combineLatest([
  //     this.selectProduct$,
  //     this.supplierService.supplier$
  // ]).pipe(
  //   map(([selectedProduct, suppliers]) =>
  //     suppliers.filter(supplier => selectedProduct.supplierIds.includes(supplier.id))
  //   )
  // );

  // issue id delay and incorret binding 
  // multiple click on link will display error result
  // selectproductwithSupplier$ = this.selectProduct$
  //   .pipe(
  //     filter(selectedProduct => Boolean(selectedProduct)),
  //     mergeMap(selectedProduct =>
  //       from(selectedProduct.supplierIds)
  //         .pipe(
  //           mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
  //           toArray()
  //         )
  //     )
  //   );

  selectproductwithSupplier$ = this.selectProduct$
  .pipe(
    filter(selectedProduct => Boolean(selectedProduct)),
    switchMap(selectedProduct =>
      from(selectedProduct.supplierIds)
        .pipe(
          mergeMap(supplierId => this.http.get<Supplier>(`${this.suppliersUrl}/${supplierId}`)),
          toArray()
        )
    )
  );

  selectedProductChanged(selectedProductId: number) {
    this.productselectSubject.next(selectedProductId);
  }

  addProduct(newProduct?: Product) {
    newProduct = newProduct || this.fakeProduct();
    this.productInsertedSubject.next(newProduct);
  }


  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
