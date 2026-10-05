from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ProvinceModel(Base):
    __tablename__ = "province_catalog"

    province_code: Mapped[str] = mapped_column(String(16), primary_key=True)
    form_option_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    label_lao: Mapped[str] = mapped_column(String(200), nullable=False)
