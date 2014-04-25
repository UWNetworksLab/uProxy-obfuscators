#include "gtest/gtest.h"
#include "ranker.h"

TEST(CauseException, InvalidFstFormatException) {
  try {
    ranker rankerObj("BAD FST", 0);
    EXPECT_TRUE(false);
  } catch (InvalidFstFormat e) {
    EXPECT_TRUE(true);
  }
}
