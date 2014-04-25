#include <iostream>

#include "gtest/gtest.h"
#include "ranker.h"

TEST(RankUnrank, CauseInvalidFstException) {
  try {
    ranker rankerObj("this is not a valid AT&T fst", 0);
    EXPECT_TRUE(false);
  } catch (InvalidFstFormat e) {
    EXPECT_TRUE(true);
  }
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
