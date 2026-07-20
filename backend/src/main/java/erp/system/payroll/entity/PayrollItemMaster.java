package erp.system.payroll.entity;

import erp.system.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;

/**
 * ERD의 payroll_item_master(item_name/item_type_code/taxable/fixed)에
 * 자동 계산에 필요한 defaultAmount(고정액)/rate(비율) 두 컬럼을 추가로 확장함.
 */
@Getter
@Entity
@Table(name = "payroll_item_master")
@SQLRestriction("deleted=false")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PayrollItemMaster extends BaseEntity {

    public static final String TYPE_EARNING = "EARNING";
    public static final String TYPE_DEDUCTION = "DEDUCTION";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payroll_item_master_id")
    private Long payrollItemMasterId;

    @Column(name = "item_name", nullable = false, length = 100)
    private String itemName;

    @Column(name = "item_type_code", nullable = false, length = 30)
    private String itemTypeCode;

    @Column(name = "taxable", nullable = false)
    private boolean taxable;

    @Column(name = "fixed", nullable = false)
    private boolean fixed;

    @Column(name = "default_amount", precision = 15, scale = 2)
    private BigDecimal defaultAmount;

    @Column(name = "rate", precision = 6, scale = 4)
    private BigDecimal rate;

    @Builder
    public PayrollItemMaster(String itemName, String itemTypeCode, boolean taxable, boolean fixed,
                             BigDecimal defaultAmount, BigDecimal rate) {
        this.itemName = itemName;
        this.itemTypeCode = itemTypeCode;
        this.taxable = taxable;
        this.fixed = fixed;
        this.defaultAmount = defaultAmount;
        this.rate = rate;
    }

    public void update(String itemName, String itemTypeCode, boolean taxable, boolean fixed,
                        BigDecimal defaultAmount, BigDecimal rate) {
        this.itemName = itemName;
        this.itemTypeCode = itemTypeCode;
        this.taxable = taxable;
        this.fixed = fixed;
        this.defaultAmount = defaultAmount;
        this.rate = rate;
    }
}
