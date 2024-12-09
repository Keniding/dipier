import {animate, query, stagger, style, transition, trigger} from "@angular/animations";

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 }))
  ])
]);

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter',
      [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger('50ms',
          animate('300ms ease-out',
            style({ opacity: 1, transform: 'translateY(0px)' })
          ))
      ],
      { optional: true }
    )
  ])
]);

export const itemAnimation = trigger('itemAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);
