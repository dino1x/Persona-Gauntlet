# DAG Action Graph

```mermaid
flowchart TD
    N0["press_key 'Tab' on Express Air<button> TA... [/]<br/>step 1"]
    N1["press_key 'Tab' on Promo code [/]<br/>step 2"]
    N2["press_key 'Tab' on Apply [/]<br/>step 3"]
    N3["press_key 'Enter' on Complete Order ($148.00) [/]<br/>step 4"]
    N4["analyze 'order_receipt' [/]<br/>step 5"]
    N0 --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
```

## Node Legend

| ID | Signature | First Seen |
|-----|-----------|------------|
| N0 | `http://localhost:4180/\|press_key\|Tab\|Express Air<button> TAB OK$18.00` | step 1 |
| N1 | `http://localhost:4180/\|press_key\|Tab\|Promo code` | step 2 |
| N2 | `http://localhost:4180/\|press_key\|Tab\|Apply` | step 3 |
| N3 | `http://localhost:4180/\|press_key\|Enter\|Complete Order ($148.00)` | step 4 |
| N4 | `http://localhost:4180/\|analyze\|order_receipt\|none` | step 5 |
